const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());


const uri = 'mongodb+srv://root:root@cluster0.mnzqwmg.mongodb.net/revitalizar?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB Atlas:', err));


const pacienteSchema = new mongoose.Schema({
    Documento: { type: Number, unique: true },
    Nombre: String,
    Apellido: String,
    Telefono: String
});

const turnoSchema = new mongoose.Schema({
    Documento: { type: Number, ref: 'Paciente' },
    Fecha_Turno: Date,
    Hora_Turno: String,
    Tipo_Consulta: String,
    Estado: String
});

const Paciente = mongoose.model('Paciente', pacienteSchema);
const Turno = mongoose.model('Turno', turnoSchema);


app.post('/pacientes', async (req, res) => {
    const { Documento, Nombre, Apellido, Telefono } = req.body;
    const nuevoPaciente = new Paciente({ Documento, Nombre, Apellido, Telefono });
    try {
        await nuevoPaciente.save();
        res.status(201).send(`Paciente registrado con Documento: ${Documento}`);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/turnos', async (req, res) => {
    const { Documento, Fecha_Turno, Hora_Turno, Tipo_Consulta } = req.body;
    const nuevoTurno = new Turno({ Documento, Fecha_Turno, Hora_Turno, Tipo_Consulta, Estado: 'Pendiente' });
    try {
        await nuevoTurno.save();
        res.status(201).send(`Turno solicitado con ID: ${nuevoTurno._id}`);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/pacientes', async (req, res) => {
    try {
        const pacientes = await Paciente.find();
        res.status(200).json(pacientes);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/turnos', async (req, res) => {
    try {
        const turnos = await Turno.find();
        res.status(200).json(turnos);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/turnos/:id', async (req, res) => {
    const { Estado } = req.body;
    const { id } = req.params;
    try {
        const turno = await Turno.findByIdAndUpdate(id, { Estado }, { new: true });
        res.send(`Turno con ID: ${id} actualizado`);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete('/turnos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Turno.findByIdAndDelete(id);
        res.send(`Turno con ID: ${id} eliminado`);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});