const http = require('http');
const fs = require('fs')
const getDate = require('./3/modules/utils.js') // Import utility function to get the current date/time
const messages = require('./3/lang/en/en.js') // Import language messages for responses

const PORT = process.env.PORT || 4000; // Set the server port, defaulting to 4000 if not provided
const FILE_PATH = './3/file.txt'; // Path to the file for reading/writing operations

class Server {
    constructor(port) {
        this.port = port;
        this.server = http.createServer(this.handleRequest.bind(this));
    }

    handleRequest(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        res.setHeader('Content-Type', 'text/html');

        if (url.pathname === '/COMP4537/labs/3/getDate/') {
            this.getDateHandler(url, res);
        } else if (url.pathname === '/COMP4537/labs/3/writeFile/') {
            this.writeFileHandler(url, res);
        } else if (url.pathname.startsWith('/COMP4537/labs/3/readFile/')) { //using startsWith instead of ===
            this.readFileHandler(url, res);
        } else {
            res.writeHead(404);
            res.end('404 Not Found');
        }
    }

    getDateHandler(url, res) {
        const name = url.searchParams.get('name') || 'Guest';
        const currentTime = getDate.getDate();
        const responseMessage = messages.GREETINGS.replace('%1', name).replace('%2', currentTime);
        res.writeHead(200);
        res.end(`<p style='color:blue;'>${responseMessage}</p>`);
    }

    writeFileHandler(url, res) {
        const text = url.searchParams.get('text');
        if (!text) {
            res.writeHead(500);
            res.end('Internal Server Error: Unable to write to file');
            return;
        }

        fs.appendFile(FILE_PATH, text + '\n', (err) => {
            if (err) {
                res.writeHead(500);
                res.end('Internal Server Error: Unable to write to file');
                return;
            }
            res.writeHead(200);
            res.end("<p style='color:blue;'>Text appended successfully</p>");
        });
    }

    readFileHandler(url, res) {
        const pathParts = url.pathname.split('/');
        const filename = pathParts[pathParts.length - 1]; // Extract filename from the last part of the path
        const filePath = `./3/${filename}`; // Construct the full file path

        console.log(`Requested URL: ${url.pathname}`);
        console.log(`Extracted Filename: ${filename}`);
        console.log(`File Path: ${filePath}`);

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file: ${err.message}`);
                res.writeHead(404);
                res.end(`404 Not Found: File '${filename}' does not exist`);
                return;
            }
            res.writeHead(200);
            res.end(`<pre>${data}</pre>`);
        });
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }
}

const app = new Server(PORT);
app.start();