const apiBase = window.location.origin; // assumes same host/port or use full URL
const statusEl = document.getElementById('status');
const tbody = document.querySelector('#users tbody');

async function loadUsers(){
  statusEl.textContent = 'Loading...';
  try{
    const res = await fetch(`${apiBase}/users`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const users = await res.json();
    tbody.innerHTML = '';
    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${u.id}</td><td>${u.username}</td><td>${u.email || ''}</td><td>${u.role || ''}</td><td>${u.created_at || ''}</td>`;
      // add admin control: resend magic link
      const btn = document.createElement('button');
      btn.textContent = 'Resend magic link';
      btn.style.marginLeft = '8px';
      btn.addEventListener('click', async () => {
        statusEl.textContent = 'Sending magic link to ' + (u.email || '');
        try {
          const r = await fetch(`${apiBase}/auth/resend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email }) });
          const j = await r.json();
          if (!r.ok) throw new Error(j.error || 'HTTP ' + r.status);
          statusEl.textContent = 'Magic link resent to ' + u.email;
        } catch (err) {
          statusEl.textContent = 'Error: ' + err.message;
        }
      });

      const td = document.createElement('td');
      td.appendChild(btn);
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
    statusEl.textContent = `Loaded ${users.length} users.`;
  }catch(err){
    statusEl.textContent = 'Error: ' + err.message;
  }
}

document.getElementById('reload').addEventListener('click', loadUsers);
loadUsers();
