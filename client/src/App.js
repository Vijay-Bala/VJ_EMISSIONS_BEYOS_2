import React, { useEffect, useState } from 'react';
import './App.css';
import LineGraph from './components/LineGraph';

function App() {
  const [emissions, setEmissions] = useState([]);
  const [newEmission, setNewEmission] = useState({ pollutant: '', value: 0 });
  const [updateEmissionId, setUpdateEmissionId] = useState(null);
  const [updatedValue, setUpdatedValue] = useState('');
  
    useEffect(() => {
      fetch('http://localhost:5000/api/emissions')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => setEmissions(data))
        .catch((error) => console.error('Error fetching data:', error));
    }, []);

  const handleInputChange = (e) => {
    setNewEmission({ ...newEmission, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    fetch('http://localhost:5000/api/emissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEmission),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEmissions([...emissions, data]);
        setNewEmission({ pollutant: '', value: 0 });
      })
      .catch((error) => console.error('Error creating emission:', error));
  };

  const openUpdatePopup = (id, value) => {
    setUpdateEmissionId(id);
    setUpdatedValue(value.toString());
  };

  const closeUpdatePopup = () => {
    setUpdateEmissionId(null);
    setUpdatedValue('');
  };

  const handleUpdate = () => {
    if (!updateEmissionId || updatedValue === '') {
      return;
    }

    fetch(`http://localhost:5000/api/emissions/${updateEmissionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: parseFloat(updatedValue) }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const updatedEmissions = emissions.map((emission) =>
          emission._id === updateEmissionId ? data : emission
        );
        setEmissions(updatedEmissions);
        closeUpdatePopup();
      })
      .catch((error) => console.error('Error updating emission:', error));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/emissions/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const updatedEmissions = emissions.filter((emission) => emission._id !== id);
        setEmissions(updatedEmissions);
      })
      .catch((error) => console.error('Error deleting emission:', error));
  };

  return (
    <div className="App">
      <h1>VJ EMISSIONS</h1>
      <div>
        <h2>Create New Emission</h2>
        <label>Pollutant: </label>
        <input
          type="text"
          name="pollutant"
          value={newEmission.pollutant}
          onChange={handleInputChange}
        />
        <label>Value: </label>
        <input
          type="number"
          name="value"
          value={newEmission.value}
          onChange={handleInputChange}
        />
        <button onClick={handleCreate}>Create</button>
      </div>
      <div>
        <h2>Overall Emission</h2>
        <ul>
          {emissions.map((emission) => (
            <li key={emission._id}>
              {emission.pollutant}: {emission.value}{' '}
              <button onClick={() => openUpdatePopup(emission._id, emission.value)}>
                Update
              </button>
              <button onClick={() => handleDelete(emission._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Update Popup */}
      {updateEmissionId !== null && (
        <div className="update-popup" style={{zIndex:'1'}}>
          <h2>Update Emission</h2>
          <label>New Value: </label>
          <input
            type="number"
            value={updatedValue}
            onChange={(e) => setUpdatedValue(e.target.value)}
          />
          <button onClick={handleUpdate}>Update</button>
          <button onClick={closeUpdatePopup}>Cancel</button>
        </div>
      )}
      <LineGraph emissions={emissions} />
    </div>
  );
}

export default App;
