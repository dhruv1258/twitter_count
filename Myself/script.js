// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Get current timestamp
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// Initialize or get post data from localStorage
function getPostData() {
    const data = localStorage.getItem('twitterPostData');
    if (data) {
        return JSON.parse(data);
    }
    return {
        totalPosts: 0,
        posts: [],
        topicStats: {}
    };
}

// Save post data to localStorage
function savePostData(data) {
    localStorage.setItem('twitterPostData', JSON.stringify(data));
}

// Get today's post count
function getTodayCount() {
    const data = getPostData();
    const today = getCurrentDate();
    return data.posts.filter(post => post.date === today).length;
}

// Get popular topics for quick access
function getPopularTopics() {
    const data = getPostData();
    const topics = Object.entries(data.topicStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic]) => topic);
    return topics;
}

// Update the display
function updateDisplay() {
    const data = getPostData();
    const todayCount = getTodayCount();
    
    document.getElementById('postCount').textContent = todayCount;
    document.getElementById('totalCount').textContent = data.totalPosts;
    
    updateTopicStats();
    updatePostsList();
    updateQuickTopics();
}

// Add a post
function addPost() {
    const topicInput = document.getElementById('topicInput');
    const topic = topicInput.value.trim();
    
    if (!topic) {
        alert('Please enter a topic/tag for your post');
        return;
    }
    
    const data = getPostData();
    const today = getCurrentDate();
    const timestamp = getCurrentTimestamp();
    
    // Add new post
    const newPost = {
        id: Date.now(),
        topic: topic,
        date: today,
        timestamp: timestamp
    };
    
    data.posts.unshift(newPost);
    data.totalPosts++;
    
    // Update topic statistics
    if (!data.topicStats[topic]) {
        data.topicStats[topic] = 0;
    }
    data.topicStats[topic]++;
    
    savePostData(data);
    updateDisplay();
    
    // Clear input and add animation
    topicInput.value = '';
    animateCount('postCount');
    animateCount('totalCount');
}

// Delete a specific post
function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        const data = getPostData();
        const post = data.posts.find(p => p.id === postId);
        
        if (post) {
            // Remove post from array
            data.posts = data.posts.filter(p => p.id !== postId);
            data.totalPosts--;
            
            // Update topic statistics
            data.topicStats[post.topic]--;
            if (data.topicStats[post.topic] === 0) {
                delete data.topicStats[post.topic];
            }
            
            savePostData(data);
            updateDisplay();
        }
    }
}

// Reset today's count
function resetDay() {
    if (confirm('Are you sure you want to delete all posts from today?')) {
        const data = getPostData();
        const today = getCurrentDate();
        
        // Get today's posts
        const todayPosts = data.posts.filter(post => post.date === today);
        
        // Update topic stats
        todayPosts.forEach(post => {
            data.topicStats[post.topic]--;
            if (data.topicStats[post.topic] === 0) {
                delete data.topicStats[post.topic];
            }
        });
        
        // Remove today's posts
        data.posts = data.posts.filter(post => post.date !== today);
        data.totalPosts -= todayPosts.length;
        
        savePostData(data);
        updateDisplay();
    }
}

// Reset all data
function resetAll() {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
        localStorage.removeItem('twitterPostData');
        updateDisplay();
    }
}

// Update topic statistics display
function updateTopicStats() {
    const data = getPostData();
    const topicStatsDiv = document.getElementById('topicStats');
    
    if (Object.keys(data.topicStats).length === 0) {
        topicStatsDiv.innerHTML = '<div class="no-topics">No topics yet. Add your first post!</div>';
        return;
    }
    
    // Sort topics by count
    const sortedTopics = Object.entries(data.topicStats)
        .sort((a, b) => b[1] - a[1]);
    
    topicStatsDiv.innerHTML = '';
    
    sortedTopics.forEach(([topic, count]) => {
        const card = document.createElement('div');
        card.className = 'topic-stat-card';
        card.innerHTML = `
            <div class="topic-name">${topic}</div>
            <div class="topic-count">${count}</div>
            <div class="topic-label">post${count !== 1 ? 's' : ''}</div>
        `;
        topicStatsDiv.appendChild(card);
    });
}

// Update posts list display
function updatePostsList() {
    const data = getPostData();
    const postsListDiv = document.getElementById('postsList');
    
    if (data.posts.length === 0) {
        postsListDiv.innerHTML = '<div class="no-posts">No posts yet. Start tracking!</div>';
        return;
    }
    
    postsListDiv.innerHTML = '';
    
    // Show all posts
    data.posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        
        const timestamp = new Date(post.timestamp);
        const timeString = timestamp.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        postItem.innerHTML = `
            <div class="post-info">
                <div class="post-topic">${post.topic}</div>
                <div class="post-timestamp">${timeString}</div>
            </div>
            <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
        `;
        
        postsListDiv.appendChild(postItem);
    });
}

// Update quick topics display
function updateQuickTopics() {
    const quickTopicsDiv = document.getElementById('quickTopics');
    const popularTopics = getPopularTopics();
    
    if (popularTopics.length === 0) {
        quickTopicsDiv.innerHTML = '';
        return;
    }
    
    quickTopicsDiv.innerHTML = '<div style="font-size: 0.85rem; color: #657786; margin-bottom: 8px;">Quick select:</div>';
    
    popularTopics.forEach(topic => {
        const tag = document.createElement('span');
        tag.className = 'quick-topic-tag';
        tag.textContent = topic;
        tag.onclick = () => {
            document.getElementById('topicInput').value = topic;
        };
        quickTopicsDiv.appendChild(tag);
    });
}

// Animate count change
function animateCount(elementId) {
    const element = document.getElementById(elementId);
    element.style.transform = 'scale(1.2)';
    element.style.transition = 'transform 0.2s ease';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

// Event listeners
document.getElementById('addPost').addEventListener('click', addPost);
document.getElementById('resetDay').addEventListener('click', resetDay);
document.getElementById('resetAll').addEventListener('click', resetAll);

// Allow Enter key to submit
document.getElementById('topicInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPost();
    }
});

// Initialize display on load
updateDisplay();
