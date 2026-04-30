// Function to load navbar HTML
function loadNavbar() {
    fetch('../components/navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar').innerHTML = html;
            initializeNavbar();
        })
        .catch(error => console.error('Error loading navbar:', error));
}

// Function to initialize navbar functionality
function initializeNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) {
        console.log('Navbar not found, retrying...');
        setTimeout(initializeNavbar, 100);
        return;
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    const profileLink = document.querySelector('#profile-link');
    const loginButton = document.querySelector('#login-button');
    const registerButton = document.querySelector('#register-button');
    const userProfile = document.querySelector('#user-profile');
    const userName = document.querySelector('#user-name');
    const profilePic = document.querySelector('#profile-pic');
    const logoutButton = document.querySelector('#logout-button');

    // Mobile menu toggle (only if elements exist)
    if (menuToggle && navLinks && authButtons) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Clone auth buttons for mobile menu
            if (navLinks.classList.contains('active')) {
                const mobileAuthButtons = authButtons.cloneNode(true);
                mobileAuthButtons.classList.add('mobile');
                if (!navLinks.querySelector('.auth-buttons.mobile')) {
                    navLinks.appendChild(mobileAuthButtons);
                }
            } else {
                const mobileAuthButtons = navLinks.querySelector('.auth-buttons.mobile');
                if (mobileAuthButtons) {
                    mobileAuthButtons.remove();
                }
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.navbar') && navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                const mobileAuthButtons = navLinks.querySelector('.auth-buttons.mobile');
                if (mobileAuthButtons) {
                    mobileAuthButtons.remove();
                }
            }
        });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class based on scroll position
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Check if user is logged in (presence of user data in localStorage)
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {


        const dropdown = document.getElementById('user-dropdown');
const optionsList = document.getElementById('user-options-list');

// Role-based dropdown options
const facultyOptions = [
    { label: "Create Event", url: "../faculty-dashbord/create-event.html" },
    { label: "Create Collab", url: "../faculty-dashbord/create-collab.html" },
    { label: "My Events", url: "../faculty-dashbord/my-events.html" },
];

const studentOptions = [
    { label: "Create Collab", url: "../student-dashbord/create-collab.html" },
    { label: "My Certificates", url: "../student-dashbord/my-certificate.html" },
    { label: "My Events", url: "../student-dashbord/my-event.html" },
];

// Populate dropdown
const roleBasedOptions = user.role === 'faculty' ? facultyOptions : studentOptions;
optionsList.innerHTML = '';
roleBasedOptions.forEach(option => {
    const li = document.createElement('li');
    li.textContent = option.label;
    li.onclick = () => window.location.href = option.url;
    optionsList.appendChild(li);
});

// Toggle dropdown on click
[userName, profilePic].forEach(el => {
    el.addEventListener('click', () => {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
});

// Hide dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('#user-profile')) {
        dropdown.style.display = 'none';
    }
});


        // If the user is logged in, show their profile picture and name
        if (profileLink) {
            profileLink.style.display = 'block'; // Show profile link
        }

        if (loginButton && registerButton) {
            loginButton.style.display = 'none'; // Hide login button
            registerButton.style.display = 'none'; // Hide register button
        }

        if (userProfile) {
            userProfile.style.display = 'flex'; // Show user profile section
            userName.textContent = `Hello, ${user.name}`; // Show the user's name
            profilePic.src = `http://localhost:5000/uploads/${user.profilePic}` || '../pages/photo.png'; // Display profile picture
        }

        // Logout functionality
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('user'); // Clear user data from localStorage
                window.location.href = '../pages/login.html'; // Redirect to login page
            });
        }
    } else {
        // If the user is not logged in, show login/register buttons
        if (profileLink) {
            profileLink.style.display = 'none'; // Hide profile link
        }

        if (loginButton && registerButton) {
            loginButton.style.display = 'inline-block'; // Show login button
            registerButton.style.display = 'inline-block'; // Show register button
        }

        if (userProfile) {
            userProfile.style.display = 'none'; // Hide user profile section
        }
    }
}

// Start loading navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', loadNavbar);
