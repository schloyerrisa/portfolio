import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedYear = null;

let colors = d3.scaleOrdinal(d3.schemeTableau10);
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

function getSearchFilteredProjects() {
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

function getVisibleProjects() {
  let searchFilteredProjects = getSearchFilteredProjects();

  if (selectedYear === null) {
    return searchFilteredProjects;
  }

  return searchFilteredProjects.filter((project) => {
    return String(project.year) === String(selectedYear);
  });
}

function renderPieChart(projectsGiven) {
  let svg = d3.select('#projects-pie-plot');
  let legend = d3.select('.legend');

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);

  arcData.forEach((arcDatum, idx) => {
    let year = arcDatum.data.label;

    svg
      .append('path')
      .attr('d', arcGenerator(arcDatum))
      .attr('fill', colors(idx))
      .attr('class', selectedYear === year ? 'selected' : '')
      .on('click', () => {
        selectedYear = selectedYear === year ? null : year;
        updateDisplay();
      });
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('class', `legend-item ${selectedYear === d.label ? 'selected' : ''}`)
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedYear = selectedYear === d.label ? null : d.label;
        updateDisplay();
      });
  });
}

function updateDisplay() {
  let searchFilteredProjects = getSearchFilteredProjects();
  let visibleProjects = getVisibleProjects();

  renderProjects(visibleProjects, projectsContainer, 'h2');
  renderPieChart(searchFilteredProjects);
}

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  updateDisplay();
});

updateDisplay();