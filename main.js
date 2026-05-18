let usernames = [];
let users = [];
let totalRespawns;
let totalTime;
let topTime;
let clientData;

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

fetch('https://raw.githubusercontent.com/DoraChad/PPV-Recap/refs/heads/main/data.json')
    .then(res => res.json())
    .then(data => {
        users = data.users;
        usernames = data.users.map(u => u.nickname);
        totalRespawns = data.users.reduce((sum, u) => sum + u.totalRespawns, 0);
        totalTime = data.users.reduce((sum, u) => sum + u.totalTimeSeconds, 0);
        topTime = [...data.users].sort((a, b) => b.totalTimeSeconds - a.totalTimeSeconds);

    initModal();
});

function initModal() {

    document.getElementById("total_players").innerHTML = usernames.length;
    document.getElementById("total_players").dataset.count = usernames.length;

    document.getElementById("total_respawns").innerHTML = totalRespawns;
    document.getElementById("total_respawns").dataset.count = totalRespawns;

    document.getElementById("total_time").innerHTML = totalTime;
    document.getElementById("total_time").dataset.count = totalTime;

    document.getElementById("gold_name").innerHTML = topTime[0].nickname;
    document.getElementById("gold_time").innerHTML = formatTime(topTime[0].totalTimeSeconds);
    document.getElementById("gold_resp").innerHTML = topTime[0].totalRespawns;

    document.getElementById("silver_name").innerHTML = topTime[1].nickname;
    document.getElementById("silver_time").innerHTML = formatTime(topTime[1].totalTimeSeconds);
    document.getElementById("silver_resp").innerHTML = topTime[1].totalRespawns;

    document.getElementById("bronze_name").innerHTML = topTime[2].nickname;
    document.getElementById("bronze_time").innerHTML = formatTime(topTime[2].totalTimeSeconds);
    document.getElementById("bronze_resp").innerHTML = topTime[2].totalRespawns;


    const searchInput = document.getElementById('searchInput');
    const suggestions = document.getElementById('suggestions');
    const skipBtn = document.getElementById('skipBtn');
    const modal = document.getElementById('modal');

    function renderSuggestions(query) {
        suggestions.innerHTML = '';

        const matches = query
        ? users.filter(u => u.nickname.toLowerCase().includes(query.toLowerCase()))
        : users;

        if (matches.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'suggestion-empty';
            empty.textContent = 'No results found';
            suggestions.appendChild(empty);
        } else {
            matches.forEach(user => {
                const div = document.createElement('div');
                div.className = 'suggestion';
                div.innerHTML = `<span class="suggestion-name">${user.nickname}</span>`;
                div.addEventListener('click', () => selectUser(user));
                suggestions.appendChild(div);
            });
        }

        suggestions.classList.add('show');
    }

    searchInput.addEventListener('focus', () => renderSuggestions(''));
    searchInput.addEventListener('input', () => renderSuggestions(searchInput.value));

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.modal-card')) {
            suggestions.classList.remove('show');
        }
    });

    skipBtn.addEventListener('click', () => {
        document.getElementById("personal").remove();
        modal.style.display = 'none';
    });

    renderChart();
}

function selectUser(user) {
    clientData = user;
    document.getElementById('modal').style.display = 'none';
    document.querySelector('.title-big').innerHTML = "YOUR<br>RECAP<br><span class='name'></span>";
    document.querySelector('.name').textContent = user.nickname;

    document.getElementById("client_hours").innerHTML = clientData.totalTimeSeconds;
    document.getElementById("client_hours").dataset.count = clientData.totalTimeSeconds;

    document.getElementById("client_resp").innerHTML = clientData.totalRespawns;
    document.getElementById("client_resp").dataset.count = clientData.totalRespawns;

    const timeRank = topTime.findIndex(u => u.userId === clientData.userId) + 1;

    document.getElementById("client_rank").innerHTML = timeRank;
    document.getElementById("client_rank").dataset.count = timeRank;

    const perc_hours = Math.floor((clientData.totalTimeSeconds / totalTime) * 10000) / 100
    const perc_resp = Math.floor((clientData.totalRespawns / totalRespawns) * 10000) / 100
    const percentile = Math.floor(((usernames.length - timeRank) / usernames.length) * 100);

    document.getElementById("client_hours_perc").innerHTML = perc_hours;
    document.getElementById("client_hours_perc").dataset.count = perc_hours;
    
    document.getElementById("client_resp_perc").innerHTML = perc_resp;
    document.getElementById("client_resp_perc").dataset.count = perc_resp;
    
    document.getElementById("client_rank_perc").innerHTML = percentile;
    document.getElementById("client_rank_perc").dataset.count = percentile;

    renderChart(user);
}

function renderChart(userIsViewing = null) {
  const chart = document.getElementById('dropChart');
  const bars = document.getElementById('dropBars');
  const ruler = document.getElementById('dropRuler');
  const titleEl = document.getElementById('chart_title');
  const subEl = document.getElementById('chart_sub');

  let displayUsers;
  if (userIsViewing) {
    const userRank = topTime.findIndex(u => u.userId === userIsViewing.userId);
    const start = Math.max(0, userRank - 3);
    const end = Math.min(topTime.length, userRank + 4);
    displayUsers = topTime.slice(start, end);
    titleEl.textContent = 'Players Around You';
    subEl.textContent = 'Your nearest competition by total time played.';
  } else {
    displayUsers = topTime.slice(0, 10);
    titleEl.textContent = 'Top Players';
    subEl.textContent = 'The most dedicated racers, to scale.';
  }

  const maxSeconds = displayUsers[0].totalTimeSeconds;
  const maxHours = Math.ceil(maxSeconds / 3600 / 10) * 10;
  const PX_PER_HOUR = 20;

  const chartHeight = 60 + maxHours * PX_PER_HOUR + 80;
  chart.style.minHeight = chartHeight + 'px';

  ruler.innerHTML = '';
  ruler.style.height = (maxHours * PX_PER_HOUR) + 'px';
  for (let h = 0; h <= maxHours; h += 5) {
    const tick = document.createElement('div');
    tick.className = 'drop-tick' + (h % 10 === 0 ? ' major' : '');
    tick.style.top = (h * PX_PER_HOUR) + 'px';
    tick.textContent = h + 'h';
    ruler.appendChild(tick);
  }

  chart.querySelectorAll('.drop-grid-line').forEach(el => el.remove());
  for (let h = 10; h <= maxHours; h += 10) {
    const grid = document.createElement('div');
    grid.className = 'drop-grid-line';
    grid.style.top = (60 + h * PX_PER_HOUR) + 'px';
    chart.appendChild(grid);
  }

  bars.innerHTML = '';
  bars.style.height = (maxHours * PX_PER_HOUR + 80) + 'px';
  displayUsers.forEach(user => {
    const hours = user.totalTimeSeconds / 3600;
    const barHeight = hours * PX_PER_HOUR;
    const actualRank = topTime.findIndex(u => u.userId === user.userId) + 1;

    const isUser = userIsViewing && user.userId === userIsViewing.userId;
    const isTop1 = actualRank === 1;

    const classes = ['drop-bar'];
    if (isTop1) classes.push('top1');
    if (isUser) classes.push('is-user');

    const bar = document.createElement('div');
    bar.className = classes.join(' ');
    bar.innerHTML = `
      <span class="bar-rank">#${actualRank}</span>
      <span class="bar-value">${formatTime(user.totalTimeSeconds)}</span>
      <div class="bar-track-v" data-height="${barHeight}">
        <div class="bar-fill"></div>
      </div>
      <span class="bar-name">${user.nickname}</span>
    `;
    bars.appendChild(bar);
  });

  animateBars(chart);
}

function animateBars(chart) {
  if (chart._barObserver) chart._barObserver.disconnect();

  chart._barObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.drop-bar').forEach((bar, i) => {
          const track = bar.querySelector('.bar-track-v');
          const h = track.dataset.height;
          track.style.height = '0px';
          bar.classList.remove('in');
          setTimeout(() => {
            track.style.height = h + 'px';
            bar.classList.add('in');
          }, i * 70);
        });
        chart._barObserver.disconnect();
      }
    });
  }, { threshold: 0.02 });

  chart._barObserver.observe(chart);
}

const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
        if(e.isIntersecting){
            e.target.classList.add('in');
            e.target.querySelectorAll('[data-count]').forEach(el=>{
            const end = parseFloat(el.dataset.count); // ← parseFloat
            const dur = 1600; const start = performance.now();
            const format = el.dataset.format;
            const tick = t=>{
                const p = Math.min((t-start)/dur,1);
                const eased = 1-Math.pow(1-p,3);
                const value = end*eased; //
                if(format === 'time') {
                    const h = Math.floor(value / 3600);
                    const m = Math.floor((value % 3600) / 60);
                    el.textContent = `${h}h ${m}m`;
                } else if(format === 'percent') {
                    el.textContent = `${value.toFixed(2)}%`;
                } else {
                    el.textContent = Math.round(value).toLocaleString();
                }
                if(p<1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            });
        }
    });
},{threshold:.15});

document.querySelectorAll('.reveal').forEach(el=>io.observe(el));