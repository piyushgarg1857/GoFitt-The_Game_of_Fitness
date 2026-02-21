
const { spawn } = require('child_process');

const uri = "mongodb+srv://piyushgarg8764_db_user:xZHEOQUHGiXf9ph6@cluster0.frsxxwd.mongodb.net/gofitt?retryWrites=true&w=majority&appName=Cluster0";

function setEnv(name, value) {
    const child = spawn('vercel', ['env', 'add', name, 'production'], {
        stdio: ['pipe', 'inherit', 'inherit'],
        shell: true
    });

    child.stdin.write('n\n'); // sensitive? No
    setTimeout(() => {
        child.stdin.write(value + '\n');
        child.stdin.end();
    }, 1000);

    child.on('close', (code) => {
        console.log(`Command finished with code ${code}`);
    });
}

setEnv('MONGODB_URI', uri);
setEnv('JWT_SECRET', 'gofitt-production-secret-2026-piyush');
