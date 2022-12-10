import { Button, Form, Card, CardGroup, Col, Row, Alert, FormGroup } from 'react-bootstrap';
import React, { Component, useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { AuthProvider, useAuth } from "./context/authContext";
import { realtimeDb, storage } from "./firebaseConfig";
import { ref, set, onValue } from "firebase/database";
import { ref as refStorage, uploadBytes, getDownloadURL, listAll, list } from "firebase/storage";
import { v4 as uuid } from 'uuid';


export function Inicio() {
  document.body.style.overflow = 'visible';

  const [post, setPost] = useState("");
  const [posts, setPosts] = useState([]);
  const { loading, user } = useAuth();
  const [imageUpload, setImageUpload] = useState(null);
  const [comentario, setComentario] = useState(null);

  useEffect(() => {
    onValue(ref(realtimeDb, "Publicaciones/"), (snapshot) => {
      setPosts([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data).map((post) => {
          setPosts((oldArray) => [...oldArray, post]);
        });
      }
    });
  }, []);

  var logeado = false;
  if (user !== null || user !== undefined) {
    logeado = true;
  }


  if (loading) return <h1>Cargando...</h1>

  const upload = async (e) => {
    e.preventDefault();

    try {
      if (comentario === null && imageUpload === null) {
        alert("Campos vacios");
      } else {

        const id = uuid();
        const referencia = ref(realtimeDb, 'Publicaciones/' + id);

        if (imageUpload !== null) {
          const imageRef = refStorage(storage, `posts/${imageUpload.name + id}`);
          await uploadBytes(imageRef, imageUpload).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((url) => {

              const current = new Date();
              set(referencia, {
                dueño: user.email,
                id: id,
                imagenURL: url,
                post: comentario,
                fecha: current.getDate() + "/" + (current.getMonth() + 1) + "/" + current.getFullYear(),
              });
            });
          });

          alert("Post realizado");
        } else {

          const current = new Date();
          set(referencia, {
            dueño: user.email,
            id: id,
            post: comentario,
            fecha: current.getDate() + "/" + (current.getMonth() + 1) + "/" + current.getFullYear(),
          });

          alert("Post realizado");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <>
      <Navbar style={{ position: "sticky", top: 0, zIndex: 1030 }} bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">Proyecto Final</Navbar.Brand>
          <Nav className="ml-auto">
            {!user && <Nav.Link href="/autenticar" logeado="true">Iniciar Sesion</Nav.Link>}
            {user && <Nav.Link href="/autenticar" logeado="true">{user.email}</Nav.Link>}
          </Nav>
        </Container>
      </Navbar>
      <br />
      <div className='contenido bg-dark shadow-sm p-3 mb-5 rounded card mx-auto align-items-center ' style={{ width: "90%", border: "dark" }}>
        {user ?
          [
            <div className='w-50 mh-25 mb-5'>
              <Card className="w-auto">
                <Form onSubmit={upload} style={{ width: "80%", marginLeft: "10%" }}>
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Seleccione imagen:</Form.Label>
                    <Form.Control onChange={(event) => { setImageUpload(event.target.files[0]); }} type="file" />
                  </Form.Group>
                  <Form.Group className="mb-1" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Comentario: </Form.Label>
                    <Form.Control name='comentario' onChange={(event) => { setComentario(event.target.value); }} as="textarea" rows={3} />
                  </Form.Group>
                  <Button className="btn btn-success text-uppercase" type='submit' style={{ marginTop: "10px", minWidth: "100%", width: "100%" }}>Publicar</Button>
                </Form>
              </Card>
            </div>
          ] : null
        }

            <div className='w-75 h-auto shadow-sm p-3 mb-5'>
              {posts.map((post) => (
                <>
                  <Card className='mb-5 border-0 shadow-sm p-2'>
                    <Card.Header>
                      <span>{post.dueño} - </span> <span className='text-reset fst-italic text-end'>{post.fecha}</span>
                    </Card.Header>
                    <Card.Body>{post.post}
                    </Card.Body>
                    <Card.Img onError={(event) => event.target.style.display = 'none'} className='img-fluid shadow-4' variant="bottom" src={post.imagenURL} />
                  </Card>
                </>
              ))}
            </div>
      </div>

    </>);

}

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="autenticar" element={<Autenticacion />} />
        </Routes>
      </AuthProvider>
    </>);
}

export function Autenticacion() {
  document.body.style.overflow = 'hidden';
  const { logout, user } = useAuth();
  if (user !== null || user !== undefined) {
    async function cerrar() {
      await logout()
    };
    cerrar();
  }

  return (
    <>
      <AuthProvider>
        <Row className='h-100 align-items-center'>
          <CardGroup className='vh-100'>
            <Login></Login>
            <Register></Register>
          </CardGroup>
        </Row>
      </AuthProvider>
    </>
  );
}

export function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();
  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState("");

  const handleChange = ({ target: { name, value } }) =>
    setUser({ ...user, [name]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(user.email, user.password);
      navigate("/");
    }
    catch (error) {
      setError(error.message);
    }

  };

  return (
    <>
      <Card className="bg-dark text-white rounded-0" >
        <Form onSubmit={handleSubmit} style={{ width: "80%", marginLeft: "10%", marginTop: "60%" }}>
          <Form.Label style={{ fontSize: 20 }} className="fw-bold fst-italic text-uppercase">Inicia Sesion</Form.Label>
          <Form.Group >
            <Form.Control name="email" onChange={handleChange} type="email" placeholder="Email" />
          </Form.Group>
          <Form.Group style={{ marginTop: "10px" }}>
            <Form.Control name="password" onChange={handleChange} type="password" placeholder="Contraseña" />
          </Form.Group>
          <Button className="btn btn-success text-uppercase" type='submit' style={{ marginTop: "10px", minWidth: "100%", width: "100%" }}>Iniciar</Button>
          {error && <Alert key="danger" variant="danger">{"Error: " + error}</Alert>}
        </Form>
      </Card>
    </>
  );
}

export function Register() {
  const { signup } = useAuth();
  const [user, setUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = ({ target: { name, value } }) =>
    setUser({ ...user, [name]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await signup(user.email, user.password);
      const id = uuid();
      console.log(user.id);
      const referencia = ref(realtimeDb, 'Usuarios/' + id);
      await set(referencia, {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        contraseña: user.password,
      });
      setSuccess("Usuario registrado con exito");
    }
    catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <Card className='rounded-0' >
        <Form onSubmit={handleSubmit} style={{ width: "80%", marginLeft: "10%", marginTop: "50%" }}>
          <Form.Label style={{ fontSize: 20 }} className="fw-bold fst-italic text-uppercase">¡Registrate!</Form.Label>
          <Form.Group >
            <Form.Control name='nombre' onChange={handleChange} type="text" placeholder="Nombre" />
          </Form.Group>
          <Form.Group style={{ marginTop: "10px" }}>
            <Form.Control name='apellido' onChange={handleChange} type="text" placeholder="Apellido" />
          </Form.Group>
          <Form.Group style={{ marginTop: "10px" }}>
            <Form.Control name='email' onChange={handleChange} type="email" placeholder="Email" />
          </Form.Group>
          <Form.Group style={{ marginTop: "10px" }}>
            <Form.Control name='password' onChange={handleChange} type="password" placeholder="Contraseña" />
          </Form.Group>
          <Button className="text-uppercase" type='submit' style={{ marginTop: "10px", minWidth: "100%", width: "100%" }}>Registrarme</Button>
          {error && <Alert key="danger" variant="danger">{"Error: " + error}</Alert>}
          {success && <Alert key="success" variant="success">{success}</Alert>}
        </Form>
      </Card>

    </>
  );
}

export default App;