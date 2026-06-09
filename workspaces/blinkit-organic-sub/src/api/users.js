const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let premiumOrganicPetFood = [
    { id: 1, name: 'Organic Dog Food', price: 20.99, deliveryTime: 10 },
    { id: 2, name: 'Gluten-Free Cat Food', price: 15.99, deliveryTime: 10 },
    { id: 3, name: 'Grain-Free Pet Treats', price: 10.99, deliveryTime: 10 }
];

app.get('/premium-organic-pet-food', (req, res) => {
    res.json(premiumOrganicPetFood);
});

app.get('/premium-organic-pet-food/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const food = premiumOrganicPetFood.find(f => f.id === id);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.json(food);
});

app.post('/premium-organic-pet-food', (req, res) => {
    const { name, price, deliveryTime } = req.body;
    const newFood = { id: premiumOrganicPetFood.length + 1, name, price, deliveryTime };
    premiumOrganicPetFood.push(newFood);
    res.json(newFood);
});

app.put('/premium-organic-pet-food/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const food = premiumOrganicPetFood.find(f => f.id === id);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    food.name = req.body.name;
    food.price = req.body.price;
    food.deliveryTime = req.body.deliveryTime;
    res.json(food);
});

app.delete('/premium-organic-pet-food/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = premiumOrganicPetFood.findIndex(f => f.id === id);
    if (index === -1) return res.status(404).json({ message: 'Food not found' });
    premiumOrganicPetFood.splice(index, 1);
    res.json({ message: 'Food deleted' });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});