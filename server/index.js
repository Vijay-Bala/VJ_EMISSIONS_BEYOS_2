const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')

const app = express();
const PORT = 5000;


const dbconnect = async() => {
  try{
    
      const connect = await mongoose.connect('mongodb://root:example@0.0.0.0:27018/vijaybala?authMechanism=DEFAULT&authSource=admin')
      console.log("DB connected!!!");
      console.log("DB Name: ",connect.connection.name);

  }catch(err){
      console.log("DB error: ",err);
  }
}
dbconnect();

const emissionSchema = new mongoose.Schema({
  pollutant: String,
  value: Number,
});

const Emission = mongoose.model('emissions', emissionSchema);

app.use(express.json());
app.use(cors({
    origin:['http://localhost:3000']
}))

app.get('/api/emissions', async (req, res) => {
  try {
    const emissions = await Emission.find();
    res.json(emissions);
  } catch (error) {
    console.error('Error fetching emissions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/emissions/:id', async (req, res) => {
  try {
    const emission = await Emission.findById(req.params.id);
    if (!emission) {
      return res.status(404).json({ error: 'Emission not found' });
    }
    res.json(emission);
  } catch (error) {
    console.error('Error fetching emission by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/emissions', async (req, res) => {
    console.log("post:   ",req.body);
  try {
    const newEmission = await Emission.create(req.body);
    res.status(201).json(newEmission);
  } catch (error) {
    console.error('Error creating emission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/emissions/:id', async (req, res) => {
  try {
    const updatedEmission = await Emission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEmission) {
      return res.status(404).json({ error: 'Emission not found' });
    }
    res.json(updatedEmission);
  } catch (error) {
    console.error('Error updating emission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/emissions/:id', async (req, res) => {
  try {
    const deletedEmission = await Emission.findByIdAndDelete(req.params.id);
    if (!deletedEmission) {
      return res.status(404).json({ error: 'Emission not found' });
    }
    res.json({ message: 'Emission deleted successfully' });
  } catch (error) {
    console.error('Error deleting emission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log( `Server is running on port ${PORT}`);
});
