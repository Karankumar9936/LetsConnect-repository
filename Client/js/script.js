 // --- 1. CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api';
const socket = io("http://localhost:5000"); 

let currentCampaignId = null; 
let activeRoomId = null; 

// --- 2. VIEW MANAGEMENT (Optimized) ---
function showView(viewId) {
    // 1. Handle "active" classes for CSS transitions
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none'; // Ensure hidden views don't take space
    });

    // Support both 'profile-edit' and 'profile-edit-view' IDs
    const target = document.getElementById(viewId + '-view') || document.getElementById(viewId);

    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
    }

    // 2. DATA LOADING LOGIC
    // Load existing data when opening the edit page
    if (viewId === 'profile-edit' || viewId === 'profile-edit-view') {
        loadInfluencerProfile(); 
    }

    // Role-based dashboard refreshes
    if (viewId === 'admin-dashboard') loadAdminDashboard();
    if (viewId === 'influencer-dashboard') loadInfluencerDashboard();
    if (viewId === 'brand-dashboard') loadBrandDashboard();
    if (viewId === 'landing') loadPublicCampaigns();

    // 3. UI REFRESH
    updateNavbar();
    
    // Crucial for icons to show up in newly visible views
    if (window.lucide) {
        lucide.createIcons();
    }
    
    window.scrollTo(0, 0);
}



// --- 3. NAVBAR & NAVIGATION ---
function updateNavbar() {
    const token = localStorage.getItem('token');
    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');
    const navName = document.getElementById('nav-user-name');

    if (token) {
        if (guestNav) guestNav.style.display = 'none';
        if (userNav) userNav.style.display = 'flex';
        
        // Fix for undefined name in navbar
        const storedName = localStorage.getItem('userName');
        if (navName) navName.textContent = (storedName && storedName !== "undefined") ? storedName : 'User';
    } else {
        if (guestNav) guestNav.style.display = 'flex';
        if (userNav) userNav.style.display = 'none';
    }
}

function handleLogoClick() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) showView(role + '-dashboard');
    else showView('landing');
}

// --- 4. AUTHENTICATION ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Consistently store data
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user.role);
            localStorage.setItem('userName', data.user.name); 
            
            showToast(`Welcome back, ${data.user.name}!`);
            updateNavbar(); // Refresh navbar visibility
            
            // Redirect using showView which handles the loading logic
            showView(data.user.role + '-dashboard');
        } else {
            showToast(data.message || 'Login Failed');
        }
    } catch (err) { 
        console.error(err);
        showToast('Server Error'); 
    }
});


document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true; // Prevent double-clicking
    btn.textContent = 'Registering...';

    const role = document.getElementById('role-select').value;
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();

        // FIX: Check for response.ok (handles 200, 201, etc.)
        if (response.ok) {
            showToast('Registered! Please login.');
            showView('login');
            e.target.reset();
        } else {
            showToast(data.message || 'Registration failed');
        }
    } catch (err) { 
        console.error("Signup error:", err);
        showToast('Server Error'); 
    } finally {
        btn.disabled = false;
        btn.textContent = 'Sign Up';
    }
});

// --- 5. INFLUENCER DASHBOARD ---
async function loadInfluencerDashboard() {
    // Simplified Welcome header
    updateNavUI();
    const welcomeTitle = document.querySelector('#influencer-dashboard-view h2');
    if (welcomeTitle) welcomeTitle.textContent = `WELCOME`;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/campaigns`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const campaigns = await res.json();

        const list = document.getElementById('campaign-list');
        list.innerHTML = ''; 

        campaigns.forEach(camp => {
            list.innerHTML += `
                <div class="campaign-card">
                    <div class="campaign-body">
                        <span class="tag">${camp.platform}</span>
                        <h3>${camp.title}</h3>
                        <p>Budget: ₹${camp.budget}</p>
                        <div style="display: flex; gap: 5px; margin-top: 1rem;">
                            <button class="btn btn-primary btn-sm" style="flex: 2" onclick="openApplyModal(${camp.campaign_id}, '${camp.title}')">Apply</button>
                            <button class="btn btn-outline btn-sm" style="flex: 1" onclick="startChat(${camp.campaign_id}, '${camp.title}')">Chat</button>
                        </div>
                    </div>
                </div>`;
        });
    } catch (err) { showToast("Failed to load dashboard."); }
}

async function submitApplication() { 
    const pitch = document.getElementById('apply-pitch').value;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/applications/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ campaign_id: currentCampaignId, message: pitch })
        });
        if (response.ok) {
            showToast('Application Sent!');
            closeModal();
            loadInfluencerDashboard();
        }
    } catch (err) { showToast('Error sending application'); }
}

// --- 6. BRAND DASHBOARD --- 
async function loadBrandDashboard() {
    updateNavUI();
    const welcomeTitle = document.querySelector('#brand-dashboard-view h2');
    if (welcomeTitle) welcomeTitle.textContent = `BRAND CONSOLE`;

    const token = localStorage.getItem('token');
    const tableBody = document.getElementById('brand-campaign-list');
    
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Loading campaigns...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/brands/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 404) {
             console.error("Route /brands/dashboard not found.");
             return showToast("Error: Dashboard API not found.");
        }

        const data = await response.json();
        tableBody.innerHTML = ''; // Clear loading state

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No campaigns created yet. Click "New Campaign" to start!</td></tr>';
            return;
        }

        data.forEach(camp => {
            // Check if there are any applications for this campaign
            const hasApps = camp.Applications && camp.Applications.length > 0;

            if (!hasApps) {
                // RENDER EMPTY CAMPAIGN (No applications yet)
                tableBody.innerHTML += `
                    <tr class="table-row-empty">
                        <td class="table-cell">
                            <div class="campaign-info">
                                <strong>${camp.title}</strong><br>
                                <small class="text-muted">Platform: ${camp.platform}</small>
                            </div>
                        </td>
                        <td class="table-cell">₹${camp.budget}</td>
                        <td class="table-cell">
                            <span class="tag tag-warning">Waiting for Applicants</span>
                        </td>
                    </tr>`;
            } else {
                // RENDER CAMPAIGN WITH APPLICATIONS
                camp.Applications.forEach(app => {
                    const statusClass = app.status === 'accepted' ? 'tag-success' : (app.status === 'rejected' ? 'tag-danger' : 'tag-warning');
                    const influencerId = app.User.user_id || app.User.id;

                    tableBody.innerHTML += `
                        <tr class="table-row-active">
                            <td class="table-cell">
                                <strong>${camp.title}</strong><br>
                                <small>Influencer: ${app.User.name} (${app.User.email})</small>
                            </td>
                            <td class="table-cell">₹${camp.budget}</td>
                            <td class="table-cell">
                                ${app.status === 'pending' ? `
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-primary" onclick="updateStatus(${app.application_id}, 'accepted')">Accept</button>
                                        <button class="btn btn-sm btn-outline" onclick="updateStatus(${app.application_id}, 'rejected')">Reject</button>
                                    </div>
                                ` : `
                                    <div class="status-chat-group">
                                        <span class="tag ${statusClass}">${app.status.toUpperCase()}</span>
                                        ${app.status === 'accepted' ? `
                                            <button class="btn btn-sm btn-primary chat-btn" onclick="startChat(${camp.campaign_id}, '${camp.title.replace(/'/g, "\\'")}', ${influencerId})">
                                                <i data-lucide="message-circle"></i> Chat
                                            </button>` : ''}
                                    </div>
                                `}
                            </td>
                        </tr>`;
                });
            }
        });

        // Re-render icons if you are using Lucide
        if (window.lucide) lucide.createIcons();

    } catch (err) {
        console.error("Dashboard Load Error:", err);
        showToast("Error loading brand console");
    }
}

async function updateStatus(appId, newStatus) {
    const token = localStorage.getItem('token');
    try {
        await fetch(`${API_BASE_URL}/applications/update-status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ application_id: appId, status: newStatus })
        });
        loadBrandDashboard();
    } catch (err) { showToast("Update failed"); }
}

// --- 7. MESSAGING LOGIC ---
async function startChat(campaignId, campaignTitle, influencerIdFromBrand = null) {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Safety check for token parsing to prevent script crashes
    let payload;
    try {
        payload = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return showToast("Session error. Please logout and login.");
    }
    
    const influencerId = (role === 'influencer') ? payload.id : influencerIdFromBrand;
    
    if (!influencerId) {
        return showToast("Error: Could not identify chat recipient.");
    }

    activeRoomId = `${campaignId}_${influencerId}`; 

    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = ''; 
    document.getElementById('chat-with-title').textContent = `Chat: ${campaignTitle}`;
    showView('chat-view'); 
    
    socket.emit('join_room', activeRoomId);

    try {
        const res = await fetch(`${API_BASE_URL}/chat/history/${activeRoomId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const history = await res.json();
        if (history.length === 0) chatBox.innerHTML = '<p style="text-align:center; margin-top:20px;">No messages yet.</p>';
        else history.forEach(msg => appendMessageToUI(msg.sender_id, msg.message_text));
    } catch (err) { console.error("Chat load failed"); }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message || !activeRoomId) return;

    const token = localStorage.getItem('token');
    const payload = JSON.parse(atob(token.split('.')[1])); 

    socket.emit('send_message', {
        room: activeRoomId,
        campaign_id: activeRoomId.split('_')[0],
        message: message,
        sender_id: payload.id
    });
    input.value = '';
}

socket.on('receive_message', (data) => {
    const isChatVisible = document.getElementById('chat-view').classList.contains('active');
    if (data.room === activeRoomId && isChatVisible) {
        appendMessageToUI(data.sender_id, data.message);
    }
});

function appendMessageToUI(senderId, text) {
    const chatBox = document.getElementById('chat-box');
    const token = localStorage.getItem('token');
    const myId = JSON.parse(atob(token.split('.')[1])).id;
    const isMe = senderId == myId;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message-wrapper ${isMe ? 'me' : 'them'}`;
    msgDiv.style.display = "flex";
    msgDiv.style.justifyContent = isMe ? "flex-end" : "flex-start";
    msgDiv.innerHTML = `<div class="message-bubble" style="background:${isMe ? '#4f46e5':'#eee'}; color:${isMe?'white':'black'}; padding:10px; border-radius:10px; margin:5px;">${text}</div>`;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- 8. ADMIN DASHBOARD ---
// async function loadAdminDashboard() {
//     const token = localStorage.getItem('token');
//     try {
//         const res = await fetch(`${API_BASE_URL}/admin/users`, {
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         const users = await res.json();
//         const userList = document.getElementById('admin-user-list');
//         userList.innerHTML = '';
//         users.forEach(user => {
//             userList.innerHTML += `<tr><td>${user.name}</td><td>${user.role}</td><td><button onclick="deleteUser(${user.user_id})">Remove</button></td></tr>`;
//         });
//     } catch (err) { showToast("Admin load failed"); }
// }
// upgrade
async function loadAdminDashboard() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await res.json();
        const userList = document.getElementById('admin-user-list');
        userList.innerHTML = '';

        users.forEach(user => {
            // Added classes for styling and better button naming
            userList.innerHTML += `
                <tr class="table-row">
                    <td class="table-cell"><strong>${user.name}</strong></td>
                    <td class="table-cell"><span class="role-badge">${user.role}</span></td>
                    <td class="table-cell">
                        <button class="btn-reject" onclick="deleteUser(${user.user_id})">
                            <i data-lucide="trash-2"></i> Remove
                        </button>
                    </td>
                </tr>`;
        });
        
        // Refresh icons if you are using Lucide
        if (window.lucide) lucide.createIcons(); 

    } catch (err) { 
        showToast("Admin load failed"); 
        console.error(err);
    }
}


// --- 9. UTILITIES ---
function logout() {
    if (activeRoomId) socket.emit('leave_room', activeRoomId);
    localStorage.clear();
    window.location.reload(); 
}

// LoadPublic Campaigns
 async function loadPublicCampaigns(showAll = false) {
    const list = document.getElementById('public-campaign-list');
    const container = document.getElementById('view-all-container');
    const toggleBtn = document.getElementById('toggle-campaigns-btn');
    
    if (!list) return;

    try {
        const res = await fetch(`${API_BASE_URL}/campaigns`);
        const allCampaigns = await res.json();
        
        list.innerHTML = '';
        const token = localStorage.getItem('token');

        // Logic: Show 4 by default, or all if showAll is true
        const displayData = showAll ? allCampaigns : allCampaigns.slice(0, 4);

        displayData.forEach(camp => {
            const action = token 
                ? `onclick="openApplyModal(${camp.campaign_id}, '${camp.title}')"` 
                : `onclick="showView('login'); showToast('Login to apply')"`;

            list.innerHTML += `
                <div class="campaign-card">
                    <div class="campaign-body">
                        <span class="tag">${camp.platform}</span>
                        <h3>${camp.title}</h3>
                        <p>Budget: ₹${camp.budget}</p>
                        <button class="btn btn-primary" ${action}>Apply Now</button>
                    </div>
                </div>`;
        });

        // Toggle Button Logic
        if (allCampaigns.length > 4) {
            container.style.display = 'block';
            
            if (showAll) {
                toggleBtn.textContent = 'Show Less';
                toggleBtn.onclick = () => loadPublicCampaigns(false);
                // Smooth scroll back up so the user isn't lost at the bottom
                list.scrollIntoView({ behavior: 'smooth' });
            } else {
                toggleBtn.textContent = 'View All Campaigns';
                toggleBtn.onclick = () => loadPublicCampaigns(true);
            }
        } else {
            container.style.display = 'none';
        }

    } catch (err) { 
        console.error("Feed error:", err); 
    }
}

function openApplyModal(id, title) {
    currentCampaignId = id;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('apply-modal').style.display = 'flex';
}

function closeModal() { document.getElementById('apply-modal').style.display = 'none'; }

function showToast(msg) {
    const t = document.getElementById('toast');
    if(t) {
        t.textContent = msg; t.style.display = 'block';
        setTimeout(() => t.style.display = 'none', 3000);
    }
}

// --- 10. CAMPAIGN CREATION ---
async function createNewCampaign() {
    const title = document.getElementById('camp-title').value;
    const budget = document.getElementById('camp-budget').value;
    const platform = document.getElementById('camp-platform').value;
    const description = document.getElementById('camp-desc').value;
    const token = localStorage.getItem('token');

    // Validation
    if (!title || !budget || !platform) {
        return showToast("Please fill in all required fields.");
    }

    try {
        const response = await fetch(`${API_BASE_URL}/campaigns/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                budget,
                platform,
                description
            })
        });

        if (response.ok) {
            showToast("Campaign Created Successfully!");
            // Close modal and clear fields
            document.getElementById('campaign-modal').style.display = 'none';
            clearCampaignForm();
            // Refresh the brand dashboard to show the new campaign
            loadBrandDashboard();
        } else {
            const errorData = await response.json();
            showToast(errorData.message || "Failed to create campaign.");
        }
    } catch (err) {
        console.error("Creation error:", err);
        showToast("Error connecting to server.");
    }
}

//--11.LoadAppliedCampaigns
 async function loadMyAppliedCampaigns() {
    const token = localStorage.getItem('token');
    const listBody = document.getElementById('my-applications-list');
    const activeCountHeader = document.getElementById('inf-active-count');

    // 1. Safety Check & Loading State
    if (!listBody) return;
    listBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem;">' +
                         '<div class="loader"></div> Fetching your history...</td></tr>';

    try {
        // 2. Fetch data from your working API route
        const res = await fetch(`${API_BASE_URL}/applications/my-applications`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) throw new Error("Failed to fetch applications");

        const apps = await res.json();
        listBody.innerHTML = ''; // Clear loading state

        // 3. Handle Empty State
        if (apps.length === 0) {
            listBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align:center; padding: 3rem;">
                        <p class="text-muted">You haven't applied to any campaigns yet.</p>
                        <button class="btn btn-sm btn-outline" onclick="switchInfluencerTab('browse')">Browse Campaigns</button>
                    </td>
                </tr>`;
            if (activeCountHeader) activeCountHeader.textContent = "0";
            return;
        }

        // 4. Update Dashboard Stats
        if (activeCountHeader) activeCountHeader.textContent = apps.length;

        // 5. Render Table Rows
        apps.forEach(app => {
            // Determine status color class
            const statusClass = app.status === 'accepted' ? 'tag-success' : 
                               (app.status === 'rejected' ? 'tag-danger' : 'tag-warning');
            
            // Extract Campaign data (Capital 'C' because of Sequelize Include)
            const camp = app.Campaign || { title: 'Unknown', platform: 'N/A', budget: 0 };
            
            // Escape the title for the Chat function to prevent JS errors
            const safeTitle = camp.title.replace(/'/g, "\\'");

            listBody.innerHTML += `
                <tr class="fade-in">
                    <td class="table-cell">
                        <div class="campaign-title-group">
                            <strong>${camp.title}</strong><br>
                            <small class="text-muted">${camp.platform}</small>
                        </div>
                    </td>
                    <td class="table-cell">₹${camp.budget}</td>
                    <td class="table-cell">
                        <div class="status-action-wrapper">
                            <span class="tag ${statusClass}">${app.status.toUpperCase()}</span>
                            ${app.status === 'accepted' ? 
                                `<button class="btn btn-sm btn-primary chat-btn" 
                                         onclick="startChat(${app.campaign_id}, '${safeTitle}')">
                                    <i data-lucide="message-circle"></i> Chat
                                </button>` : ''}
                        </div>
                    </td>
                </tr>`;
        });

        // 6. Refresh Icons (if using Lucide)
        if (window.lucide) lucide.createIcons();

    } catch (err) {
        console.error("Dashboard Render Error:", err);
        listBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Error loading data. Please refresh.</td></tr>';
        showToast("Error: Could not load your applications.");
    }
}

//12. switchInfluencerTab Function 
function switchInfluencerTab(tab) {
    const browseSection = document.getElementById('inf-browse-section');
    const appliedSection = document.getElementById('inf-applied-section');
    const sideBrowse = document.getElementById('side-browse');
    const sideApplied = document.getElementById('side-applied');

    if (tab === 'applied') {
        // Show Applied, Hide Browse
        if (browseSection) browseSection.style.display = 'none';
        if (appliedSection) appliedSection.style.display = 'block';
        
        // Update Sidebar UI
        if (sideApplied) sideApplied.classList.add('active');
        if (sideBrowse) sideBrowse.classList.remove('active');
        
        loadMyAppliedCampaigns(); 
    } else {
        // Show Browse (Dashboard), Hide Applied
        if (browseSection) browseSection.style.display = 'block';
        if (appliedSection) appliedSection.style.display = 'none';
        
        // Update Sidebar UI
        if (sideBrowse) sideBrowse.classList.add('active');
        if (sideApplied) sideApplied.classList.remove('active');
        
        // RELOAD ALL CAMPAIGNS (This fixes your "missing campaigns" problem)
        if (typeof loadInfluencerDashboard === 'function') {
            loadInfluencerDashboard();
        }
    }
}

//13.
async function handleLogin(e) {
    if (e) e.preventDefault(); // Prevent page reload

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // --- CORE LOGIC ADDED HERE ---
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user.role);
            localStorage.setItem('userName', data.user.name); // Store the display name
            
            showToast(`Welcome back, ${data.user.name}!`);
            
            // Redirect based on role
            if (data.user.role === 'brand') {
                showView('brand-dashboard-view');
                loadBrandDashboard();
            } else {
                showView('influencer-dashboard-view');
                loadInfluencerDashboard();
            }
            // ------------------------------
        } else {
            showToast(data.message || "Login failed");
        }
    } catch (err) {
        console.error("Login Error:", err);
        showToast("Server error. Please try again.");
    }
}

//14
function updateNavUI() {
    const name = localStorage.getItem('userName');
    const nameSpan = document.getElementById('nav-user-name');
    
    if (nameSpan && name) {
        nameSpan.textContent = name;
    }
}


 // --- 15. PROFILE MANAGEMENT ---
async function saveInfluencerProfile() {
    const token = localStorage.getItem('token');
    if (!token) return showToast("Please login first.");

    // 1. Collect data from the new Upgraded HTML IDs
    const profileData = {
        bio: document.getElementById('edit-bio').value,
        niche: document.getElementById('edit-niche').value,
        followers_count: parseInt(document.getElementById('edit-followers').value) || 0,
        social_links: {
            instagram: document.getElementById('edit-insta').value,
            youtube: document.getElementById('edit-youtube').value // Matches new HTML
        }
    };

    try {
        // 2. Start the API call
        const response = await fetch(`${API_BASE_URL}/profile/influencer/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast("Profile Updated Successfully!");
            // 3. Smooth transition back to the dashboard
            showView('influencer-dashboard-view');
            
            // Optional: Refresh dashboard stats if you have a load function
            if (typeof loadInfluencerDashboard === 'function') {
                loadInfluencerDashboard();
            }
        } else {
            showToast(result.message || "Failed to save profile.");
        }
    } catch (err) {
        console.error("Save Error:", err);
        showToast("Server error. Please try again later.");
    }
}


//16
async function loadInfluencerProfile() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/profile/influencer/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const profile = await response.json();
            if (profile) {
                document.getElementById('edit-bio').value = profile.bio || '';
                document.getElementById('edit-niche').value = profile.niche || '';
                document.getElementById('edit-followers').value = profile.followers_count || 0;
                if (profile.social_links) {
                    document.getElementById('edit-insta').value = profile.social_links.instagram || '';
                }
            }
        }
    } catch (err) {
        console.error("Error loading profile:", err);
    }
}

// 17.
async function deleteUser(userId) {
    // 1. Ask for confirmation so you don't delete someone by mistake
    if (!confirm("Are you sure you want to remove this user? This action cannot be undone.")) {
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            showToast("User removed successfully");
            loadAdminDashboard(); // Reload the list to show they are gone
        } else {
            const errorData = await res.json();
            showToast(errorData.message || "Delete failed");
        }
    } catch (err) {
        console.error("Delete error:", err);
        showToast("Server error while deleting");
    }
}

function clearCampaignForm() {
    document.getElementById('camp-title').value = '';
    document.getElementById('camp-budget').value = '';
    document.getElementById('camp-platform').value = '';
    document.getElementById('camp-desc').value = '';
}

window.onload = () => {
    updateNavbar();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) showView(role + '-dashboard');
    else showView('landing');

    const chatInput = document.getElementById('chat-input');
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
};

 