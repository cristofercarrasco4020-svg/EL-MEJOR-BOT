// Import statements for config
const { Command } = require('../config');

// Command object with properties
const command = {
    name: 'tetas',
    alias: ['tetas'],
    category: 'NSFW',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false
};

// Create a global Set to track sent image URLs
const sentImages = global.sentImages || new Set();

// Run function
command.run = async (client, message, args) => {
    try {
        // Reacts to the message with 🔥
        await message.react('🔥');

        // Fetch a random image from a public API
        const response = await fetch('https://api.example.com/random-nsfw-image'); // Replace with a valid API
        const data = await response.json();

        // Check if the image URL is already in the memory
        if (!sentImages.has(data.url)) {
            sentImages.add(data.url); // Add to memory
            await message.channel.send(`TETAS😋\n${data.url}`); // Send the image with caption
        } else {
            // If repeated, try again with a new image
            command.run(client, message, args);
        }
    } catch (error) {
        console.error('Error fetching image:', error);
        await message.channel.send('Something went wrong!'); // Handle errors properly
    }
};

// Export as default
module.exports = command;