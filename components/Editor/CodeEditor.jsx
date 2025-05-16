import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ language, value, onChange }) => {
    const handleEditorChange = (value) => {
        onChange(value);
    };

    return (
        <div className="editor-container">
            <Editor
                height="100%"
                language={language}
                value={value}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
