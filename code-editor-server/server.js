const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Połączenie z MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/code-editor')
    .then(() => console.log('Połączono z bazą danych MongoDB'))
    .catch(err => console.error('Błąd połączenia z MongoDB:', err));

// Import tras
const projectRoutes = require('./routes/projectRoutes');

// Używanie tras
app.use('/api/projects', projectRoutes);

// Podstawowe trasy API
app.get('/', (req, res) => {
    res.send('API serwera edytora kodu działa');
});

// Konfiguracja Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Obsługa Socket.io
io.on('connection', (socket) => {
    console.log('Użytkownik połączony:', socket.id);

    // Dołączanie do pokoju projektu
    socket.on('join-project', ({ projectId }) => {
        socket.join(projectId);
        console.log(`Użytkownik ${socket.id} dołączył do projektu ${projectId}`);
    });

    // Opuszczanie pokoju projektu
    socket.on('leave-project', ({ projectId }) => {
        socket.leave(projectId);
        console.log(`Użytkownik ${socket.id} opuścił projekt ${projectId}`);
    });

    // Aktualizacja kodu
    socket.on('code-update', ({ projectId, language, content }) => {
        // Zapisujemy zmiany w bazie danych
        updateProjectContent(projectId, language, content);

        // Wysyłamy aktualizację do wszystkich w pokoju oprócz nadawcy
        socket.to(projectId).emit('code-update', { language, content });
    });

    socket.on('disconnect', () => {
        console.log('Użytkownik rozłączony:', socket.id);
    });
});

// Funkcja do aktualizacji zawartości projektu w bazie danych
async function updateProjectContent(projectId, language, content) {
    try {
        const Project = mongoose.model('Project'); // Zakładam, że model jest zdefiniowany gdzie indziej
        const project = await Project.findById(projectId);

        if (!project) return;

        // Aktualizujemy odpowiednie pole w zależności od języka
        switch (language) {
            case 'html':
                project.htmlContent = content;
                break;
            case 'css':
                project.cssContent = content;
                break;
            case 'js':
                project.jsContent = content;
                break;
            default:
                break;
        }

        project.updatedAt = Date.now();
        await project.save();
    } catch (error) {
        console.error('Błąd podczas aktualizacji projektu:', error);
    }
}
// Importowanie tras
const projectRoutes = require('./routes/projectRoutes');
const historyRoutes = require('./routes/historyRoutes');

// Używanie tras
app.use('/api/projects', projectRoutes);
app.use('/api', historyRoutes);

// Importowanie tras
const projectRoutes = require('./routes/projectRoutes');
const historyRoutes = require('./routes/historyRoutes');
const templateRoutes = require('./routes/templateRoutes');

// Używanie tras
app.use('/api/projects', projectRoutes);
app.use('/api', historyRoutes);
app.use('/api/templates', templateRoutes);

// Uruchomienie serwera
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
