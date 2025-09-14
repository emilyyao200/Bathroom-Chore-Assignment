// Filename - App.js

import React from "react";
import Navbar from "./components/Navbar";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import Home from "./pages/about";
import Contact from "./pages/contact";

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route exact path="/about" element={<Home />} />
                <Route
                    path="/contact"
                    element={<Contact />}
                />
            </Routes>
        </Router>
    );
}

export default App;