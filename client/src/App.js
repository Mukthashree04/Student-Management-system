import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./elements/Home";
import Create from "./elements/Create";
import Edit from "./elements/Edit";
import Read from "./elements/Read";
import Classrooms from "./elements/Classrooms";
import Room from "./elements/Room";
import ClassroomStudents from "./elements/ClassroomStudents";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/read/:id" element={<Read />} />
        <Route path="/classrooms" element={<Classrooms />} />
        <Route path="/classrooms/:code/students" element={<ClassroomStudents />} />
        <Route path="/room/:code" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
