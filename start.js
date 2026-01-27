#!/usr/bin/env node

/**
 * Cross-platform startup script for EcoTrace
 * Works on Windows, Linux, and macOS
 * 
 * Usage: node start.js
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const isWindows = process.platform === 'win32';
const projectRoot = __dirname;

console.log('========================================');
console.log('   EcoTrace Complete Startup Script   ');
console.log('========================================');
console.log('');

// Helper function to execute commands
function runCommand(command, args, options) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            ...options,
            shell: true,
            stdio: 'inherit'
        });
        
        proc.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
        
        proc.on('error', reject);
    });
}

// Helper to wait
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to make HTTP requests
function httpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const lib = urlObj.protocol === 'https:' ? https : http;
        
        const req = lib.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null, raw: data });
                } catch {
                    resolve({ status: res.statusCode, data: null, raw: data });
                }
            });
        });
        
        req.on('error', reject);
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

// Create admin user with et-admin role
async function createAdminUser(adminToken) {
    const KEYCLOAK_URL = 'http://localhost:8081';
    const REALM = 'Eco-Tracer';
    const username = 'admin';
    const firstName = 'Admin';
    const lastName = 'User';
    const email = 'admin@example.com';
    const password = 'admin';
    
    console.log(`  Creating user: ${username} (${firstName} ${lastName})`);
    
    try {
        // Create user in Keycloak
        const createResponse = await httpRequest(`${KEYCLOAK_URL}/admin/realms/${REALM}/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                firstName,
                lastName,
                email,
                emailVerified: true,
                enabled: true
            })
        });
        
        if (createResponse.status === 409) {
            console.log(`  ℹ User ${username} already exists - updating password`);
        } else if (createResponse.status !== 201) {
            console.log(`  ⚠ Unexpected response for ${username} (HTTP ${createResponse.status})`);
        }
        
        // Get user ID
        const userListResponse = await httpRequest(
            `${KEYCLOAK_URL}/admin/realms/${REALM}/users?username=${username}&exact=true`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            }
        );
        
        const users = userListResponse.data;
        if (!users || users.length === 0) {
            console.log(`  ⚠ Could not find user ${username}`);
            return;
        }
        
        const userId = users[0].id;
        
        // Get all roles
        const rolesResponse = await httpRequest(
            `${KEYCLOAK_URL}/admin/realms/${REALM}/roles`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            }
        );
        
        const roles = rolesResponse.data;
        const etAdminRole = roles.find(r => r.name === 'et-admin');
        const etUserRole = roles.find(r => r.name === 'et-user');
        
        // Assign et-admin role
        if (etAdminRole) {
            await httpRequest(
                `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${userId}/role-mappings/realm`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([{
                        id: etAdminRole.id,
                        name: 'et-admin'
                    }])
                }
            );
        }
        
        // Assign et-user role
        if (etUserRole) {
            await httpRequest(
                `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${userId}/role-mappings/realm`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([{
                        id: etUserRole.id,
                        name: 'et-user'
                    }])
                }
            );
        }
        
        // Set password
        await httpRequest(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${userId}/reset-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'password',
                value: password,
                temporary: false
            })
        });
        
        console.log(`  ✓ User ${username} created in Keycloak with et-admin role`);
        
        // Create user in database via backend endpoint
        try {
            const syncResponse = await httpRequest('http://localhost:8080/api/auth/users/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    externalId: userId,
                    username: username,
                    fullName: `${firstName} ${lastName}`,
                    email: email
                })
            });
            
            if (syncResponse.status === 200) {
                console.log(`  ✓ User ${username} created in database\n`);
            } else {
                console.log(`  ⚠ Could not create ${username} in database (HTTP ${syncResponse.status})`);
                if (syncResponse.raw) {
                    console.log(`     Response: ${syncResponse.raw.substring(0, 200)}`);
                }
            }
        } catch (error) {
            console.log(`  ✗ Error syncing ${username}:`, error.message);
        }
        
    } catch (error) {
        console.log(`  ✗ Error creating ${username}:`, error.message);
    }
}

// Create Keycloak user and sync to database
async function createUser(adminToken, username, firstName, lastName, email, password) {
    const KEYCLOAK_URL = 'http://localhost:8081';
    const REALM = 'Eco-Tracer';
    
    console.log(`  Creating user: ${username} (${firstName} ${lastName})`);
    
    try {
        // Create user in Keycloak
        const createResponse = await httpRequest(`${KEYCLOAK_URL}/admin/realms/${REALM}/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                firstName,
                lastName,
                email,
                emailVerified: true,
                enabled: true
            })
        });
        
        if (createResponse.status === 409) {
            console.log(`  ℹ User ${username} already exists - updating password`);
        } else if (createResponse.status !== 201) {
            console.log(`  ⚠ Unexpected response for ${username} (HTTP ${createResponse.status})`);
        }
        
        // Get user ID
        const userListResponse = await httpRequest(
            `${KEYCLOAK_URL}/admin/realms/${REALM}/users?username=${username}&exact=true`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            }
        );
        
        const users = userListResponse.data;
        if (!users || users.length === 0) {
            console.log(`  ⚠ Could not find user ${username}`);
            return;
        }
        
        const userId = users[0].id;
        
        // Assign et-user role to user (before password, so it's in effect immediately)
        try {
            const rolesResponse = await httpRequest(
                `${KEYCLOAK_URL}/admin/realms/${REALM}/roles`,
                {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                }
            );
            
            const roles = rolesResponse.data;
            const etUserRole = roles.find(r => r.name === 'et-user');
            
            if (etUserRole) {
                await httpRequest(
                    `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${userId}/role-mappings/realm`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${adminToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify([{
                            id: etUserRole.id,
                            name: 'et-user'
                        }])
                    }
                );
            }
        } catch (error) {
            console.log(`  ⚠ Could not assign role: ${error.message}`);
        }
        
        // Set password
        await httpRequest(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${userId}/reset-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'password',
                value: password,
                temporary: false
            })
        });
        
        console.log(`  ✓ User ${username} created in Keycloak`);
        
        // Create user in database via backend endpoint (no auth required)
        try {
            const syncResponse = await httpRequest('http://localhost:8080/api/auth/users/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    externalId: userId,
                    username: username,
                    fullName: `${firstName} ${lastName}`,
                    email: email
                })
            });
            
            if (syncResponse.status === 200) {
                console.log(`  ✓ User ${username} created in database`);
            } else {
                console.log(`  ⚠ Could not create ${username} in database (HTTP ${syncResponse.status})`);
                if (syncResponse.raw) {
                    console.log(`     Response: ${syncResponse.raw.substring(0, 200)}`);
                }
            }
        } catch (error) {
            console.log(`  ✗ Error syncing ${username}:`, error.message);
        }
        
    } catch (error) {
        console.log(`  ✗ Error creating ${username}:`, error.message);
    }
}

// Main execution
async function main() {
    try {
        // Step 1: Check Docker
        console.log('[1/6] Checking Docker...');
        try {
            await runCommand('docker', ['ps'], { stdio: 'ignore' });
            console.log('✓ Docker is running\n');
        } catch {
            console.error('✗ Docker is not running!');
            console.error('Please start Docker Desktop and run this script again.');
            process.exit(1);
        }
        
        // Step 2: Start Docker
        console.log('[2/6] Starting Docker Services (PostgreSQL + Keycloak)...');
        const dockerPath = path.join(projectRoot, 'backend', 'EcoTrace-E.T', 'docker');
        
        if (!fs.existsSync(path.join(dockerPath, 'docker-compose.yml'))) {
            throw new Error('docker-compose.yml not found!');
        }
        
        await runCommand('docker-compose', ['up', '-d'], { cwd: dockerPath });
        console.log('✓ Docker containers started');
        console.log('Waiting for PostgreSQL and Keycloak to be healthy...');
        await sleep(5000);
        
        // Wait for Keycloak to be healthy
        console.log('Checking Keycloak health...');
        let keycloakHealthy = false;
        for (let i = 0; i < 40; i++) {
            try {
                const result = await new Promise((resolve) => {
                    exec('docker inspect -f "{{.State.Health.Status}}" keycloak-ET', (error, stdout) => {
                        resolve(stdout.trim());
                    });
                });
                
                if (result === 'healthy') {
                    keycloakHealthy = true;
                    console.log('✓ Keycloak is healthy!\n');
                    break;
                }
                process.stdout.write('.');
                await sleep(3000);
            } catch {
                process.stdout.write('.');
                await sleep(3000);
            }
        }
        
        if (!keycloakHealthy) {
            console.log('\n⚠ Keycloak health check timeout - continuing anyway...\n');
        }
        
        // Step 3: Start Backend and wait for it
        console.log('[3/6] Starting Backend (Quarkus)...');

        const backendPath = path.join(projectRoot, 'backend', 'EcoTrace-E.T');
        const mvnCmd = isWindows ? 'mvnw.cmd' : './mvnw';
        
        if (!fs.existsSync(path.join(backendPath, isWindows ? 'mvnw.cmd' : 'mvnw'))) {
            throw new Error('Maven wrapper not found!');
        }
        
        console.log('This will open a new window for the backend.');
        console.log('Wait for "Quarkus started" message before using the app.\n');
        
        // Start backend in new window
        if (isWindows) {
            spawn('cmd', ['/c', 'start', 'cmd', '/k', `cd /d ${backendPath} && mvnw.cmd quarkus:dev`], {
                detached: true,
                stdio: 'ignore'
            }).unref();
        } else if (process.platform === 'darwin') {
            // macOS
            spawn('osascript', ['-e', `tell application "Terminal" to do script "cd '${backendPath}' && ./mvnw quarkus:dev"`], {
                detached: true,
                stdio: 'ignore'
            }).unref();
        } else {
            // Linux
            const terminals = ['gnome-terminal', 'xterm', 'konsole'];
            let launched = false;
            for (const term of terminals) {
                try {
                    spawn(term, ['--', 'bash', '-c', `cd ${backendPath} && ./mvnw quarkus:dev; exec bash`], {
                        detached: true,
                        stdio: 'ignore'
                    }).unref();
                    launched = true;
                    break;
                } catch {}
            }
            if (!launched) {
                console.log('⚠ Could not find suitable terminal - start backend manually:');
                console.log(`  cd ${backendPath} && ./mvnw quarkus:dev`);
            }
        }
        
        await sleep(3000);
        console.log('✓ Backend starting in new window');
        console.log('Waiting for Backend to respond on http://localhost:8080 ...');
        
        // Wait for backend to respond (any response means it's running)
        let backendReady = false;
        for (let i = 0; i < 45; i++) {
            await sleep(2000);
            try {
                await httpRequest('http://localhost:8080/', {
                    method: 'GET'
                });
                // Any response (200, 404, 401, etc.) means the server is up
                backendReady = true;
                console.log('\n✓ Backend is responding!\n');
                break;
            } catch (error) {
                // Only show dots on connection errors, not HTTP errors
                if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                    process.stdout.write('.');
                } else {
                    // Got HTTP response (even if error) - server is up!
                    backendReady = true;
                    console.log('\n✓ Backend is responding!\n');
                    break;
                }
            }
        }
        
        if (!backendReady) {
            console.log('\n⚠ Backend did not respond in time - continuing anyway...\n');
        }
        
        // Step 4: Create test users (now that backend is ready)
        console.log('[4/6] Creating test users...');
        try {
            // Get admin token
            const tokenResponse = await httpRequest(
                'http://localhost:8081/realms/master/protocol/openid-connect/token',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'client_id=admin-cli&username=admin&password=admin&grant_type=password'
                }
            );
            
            if (!tokenResponse.data || !tokenResponse.data.access_token) {
                console.log('⚠ Could not get admin token - skipping user creation\n');
            } else {
                const adminToken = tokenResponse.data.access_token;
                console.log('✓ Got admin token\n');
                
                // Create admin user first (with et-admin role)
                await createAdminUser(adminToken);
                
                // Create test users
                await createUser(adminToken, 'testuser', 'Test', 'User', 'test@example.com', 'password123');
                await createUser(adminToken, 'alice', 'Alice', 'Mueller', 'alice@example.com', 'password123');
                await createUser(adminToken, 'bob', 'Bob', 'Schmidt', 'bob@example.com', 'password123');
                await createUser(adminToken, 'charlie', 'Charlie', 'Weber', 'charlie@example.com', 'password123');
                await createUser(adminToken, 'diana', 'Diana', 'Klein', 'diana@example.com', 'password123');
                
                console.log('✓ All test users created and synced\n');
            }
        } catch (error) {
            console.log('✗ Error creating users:', error.message);
            console.log('You can create users manually later\n');
        }
        
        // Step 5: Start Frontend (only after backend and users are ready)
        console.log('[5/6] Starting Frontend (Angular)...');
        const frontendPath = path.join(projectRoot, 'frontend', 'project');
        
        if (!fs.existsSync(path.join(frontendPath, 'package.json'))) {
            throw new Error('package.json not found!');
        }
        
        console.log('This will open a new window for the frontend.');
        console.log('Wait for "Local: http://localhost:4200/" message.\n');
        
        // Start frontend in new window
        if (isWindows) {
            spawn('cmd', ['/c', 'start', 'cmd', '/k', `cd /d ${frontendPath} && npm start`], {
                detached: true,
                stdio: 'ignore'
            }).unref();
        } else if (process.platform === 'darwin') {
            // macOS
            spawn('osascript', ['-e', `tell application "Terminal" to do script "cd '${frontendPath}' && npm start"`], {
                detached: true,
                stdio: 'ignore'
            }).unref();
        } else {
            // Linux
            const terminals = ['gnome-terminal', 'xterm', 'konsole'];
            let launched = false;
            for (const term of terminals) {
                try {
                    spawn(term, ['--', 'bash', '-c', `cd ${frontendPath} && npm start; exec bash`], {
                        detached: true,
                        stdio: 'ignore'
                    }).unref();
                    launched = true;
                    break;
                } catch {}
            }
            if (!launched) {
                console.log('⚠ Could not find suitable terminal - start frontend manually:');
                console.log(`  cd ${frontendPath} && npm start`);
            }
        }
        
        console.log('✓ Frontend starting in new window\n');
        
        // Step 6: Open browser
        console.log('[6/6] Opening browser...');
        await sleep(8000);
        
        const browserUrl = 'http://localhost:4200';
        if (isWindows) {
            spawn('cmd', ['/c', 'start', browserUrl], { stdio: 'ignore' });
        } else if (process.platform === 'darwin') {
            spawn('open', [browserUrl], { stdio: 'ignore' });
        } else {
            spawn('xdg-open', [browserUrl], { stdio: 'ignore' });
        }
        
        console.log('');
        console.log('========================================');
        console.log('   Setup Complete!');
        console.log('========================================');
        console.log('');
        console.log('Services:');
        console.log('  - Backend:    http://localhost:8080');
        console.log('  - Frontend:   http://localhost:4200');
        console.log('  - Keycloak:   http://localhost:8081');
        console.log('  - PostgreSQL: localhost:5432');
        console.log('');
        console.log('Admin Account:');
        console.log('  - Username: admin');
        console.log('  - Password: admin');
        console.log('');
        console.log('Test Users (Password: password123):');
        console.log('  - testuser  (Test User)');
        console.log('  - alice     (Alice Mueller)');
        console.log('  - bob       (Bob Schmidt)');
        console.log('  - charlie   (Charlie Weber)');
        console.log('  - diana     (Diana Klein)');
        console.log('');
        console.log('Keycloak Admin:');
        console.log('  - URL: http://localhost:8081');
        console.log('  - Username: admin');
        console.log('  - Password: admin');
        console.log('');
        console.log('Check the two new windows for progress.');
        console.log('Browser will open automatically at http://localhost:4200');
        console.log('========================================');
        
    } catch (error) {
        console.error('\n✗ Error:', error.message);
        process.exit(1);
    }
}

main();
