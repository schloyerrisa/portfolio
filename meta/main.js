import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];

      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: 'https://github.com/schloyerrisa/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,
        writable: false,
        configurable: false,
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  function addStat(label, value, isHTML = false) {
    const stat = dl.append('div');

    if (isHTML) {
      stat.append('dt').html(label);
    } else {
      stat.append('dt').text(label);
    }

    stat.append('dd').text(value);
  }

  addStat('Total <abbr title="Lines of code">LOC</abbr>', data.length, true);
  addStat('Total commits', commits.length);
  addStat('Files', d3.group(data, (d) => d.file).size);
  addStat('Max depth', d3.max(data, (d) => d.depth));
  addStat('Longest line', d3.max(data, (d) => d.length));
  addStat('Average line length', d3.mean(data, (d) => d.length).toFixed(1));
}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);