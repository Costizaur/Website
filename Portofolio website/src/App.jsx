import React from 'react';
import Stage from './components/Stage';

// The address after the # is used for folders and projects, so the skip link moves
// focus itself instead of jumping to an anchor
const skipToContent = (e) => {
  e.preventDefault();
  document.getElementById('main').focus();
};

function App() {
  return (
    <div className="app">
      <a href="#main" className="skip-link" onClick={skipToContent}>Skip to content</a>

      {/* The whole site is one stage: the desk of folders, the folder worlds and the project pages */}
      <main id="main" tabIndex={-1}>
        <Stage />
      </main>
    </div>
  );
}

export default App;
