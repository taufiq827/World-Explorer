const fs = require('fs');
const path = require('path');

const countryName = document.getElementById('countryName');
const userNotes = document.getElementById('userNotes');
const btnSave = document.getElementById('btnSave');
const btnView = document.getElementById('btnView');
const btnDelete = document.getElementById('btnDelete');
const notesList = document.getElementById('notesList');

let pathName = path.join(__dirname, 'Files');
if (!fs.existsSync(pathName)) {
    fs.mkdirSync(pathName);
}

async function fetchCountryData(countryName) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        if (!response.ok) {
            throw new Error("Country not found. Please check the spelling.");
        }
        const [country] = await response.json();
        return country;
    } catch (error) {
        throw error;
    }
}

function formatCountryData(country, userNotes) {
    return `Country: ${country.name.common}

Continent: ${country.continents.join(', ')}
Region: ${country.region}
Currencies: ${Object.keys(country.currencies).join(', ')}
Capital: ${country.capital ? country.capital[0] : 'N/A'}
Languages: ${Object.values(country.languages).join(', ')}
Time Zones: ${country.timezones.join(', ')}

User Notes:
${userNotes}

Date Added: ${new Date().toLocaleString()}
`;
}

btnSave.addEventListener('click', async function() {
    if (!countryName.value.trim() || !userNotes.value.trim()) {
        alert('Please enter both country name and notes');
        return;
    }

    try {
        const country = await fetchCountryData(countryName.value.trim());
        const content = formatCountryData(country, userNotes.value.trim());
        
        const fileName = `${countryName.value.toLowerCase()}_notes.txt`;
        const filePath = path.join(pathName, fileName);

        fs.writeFile(filePath, content, function(err) {
            if (err) {
                alert("Error: " + err.message);
                return;
            }
            alert(`Notes for ${countryName.value} saved successfully!`);
            loadNotes();
            clearForm();
        });
    } catch (error) {
        alert(error.message);
    }
});

btnView.addEventListener('click', function() {
    if (!countryName.value.trim()) {
        alert('Please enter a country name');
        return;
    }

    const fileName = `${countryName.value.toLowerCase()}_notes.txt`;
    const filePath = path.join(pathName, fileName);

    fs.readFile(filePath, 'utf-8', function(err, data) {
        if (err) {
            alert("Error: " + err.message);
            return;
        }
        userNotes.value = data;
        document.getElementById('saved-notes').scrollIntoView({ behavior: 'smooth' });
    });
});

btnDelete.addEventListener('click', function() {
    if (!countryName.value.trim()) {
        alert('Please enter a country name');
        return;
    }

    const fileName = `${countryName.value.toLowerCase()}_notes.txt`;
    const filePath = path.join(pathName, fileName);

    fs.unlink(filePath, function(err) {
        if (err) {
            alert("Error: " + err.message);
            return;
        }
        alert(`Notes for ${countryName.value} deleted successfully!`);
        clearForm();
        loadNotes();
    });
});

function loadNotes() {
    notesList.innerHTML = '';
    fs.readdir(pathName, (err, files) => {
        if (err) {
            alert("Error loading notes: " + err.message);
            return;
        }
        files.forEach(file => {
            if (file.endsWith('_notes.txt')) {
                fs.readFile(path.join(pathName, file), 'utf-8', (err, data) => {
                    if (err) return;
                    
                    const listItem = document.createElement('div');
                    listItem.className = 'note-card';
                    listItem.innerHTML = `
                        <h3>${file.replace('_notes.txt', '').toUpperCase()}</h3>
                        <pre class="note-content">${data}</pre>
                        <button class="load-btn" onclick="loadNoteToForm('${file}')">Edit</button>
                    `;
                    notesList.appendChild(listItem);
                });
            }
        });
    });
}

function clearForm() {
    countryName.value = '';
    userNotes.value = '';
}

loadNotes();

function loadNoteToForm(filename) {
    const filePath = path.join(pathName, filename);
    fs.readFile(filePath, 'utf-8', function(err, data) {
        if (err) {
            alert("Error: " + err.message);
            return;
        }
        countryName.value = filename.replace('_notes.txt', '');
        userNotes.value = data;
    });
}
