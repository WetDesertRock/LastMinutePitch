<template>
  <div class="pitch-list">
    <router-link v-for="pitch in sortedPitches" :key="pitch.Id" :to="{ name: 'slides', params: { id: pitch.Id } }" class="pitch-item">
      <p>
        <span class="link-content">
          <span class="company-name">{{ pitch.companyName }}</span>&nbsp;<span class="middle-text">a&nbsp;{{ pitch.companyType }}&nbsp;-</span>&nbsp;<span :title="formatAbsoluteDate(pitch.createdDate)" class="date">{{ formatRelativeDate(pitch.createdDate) }}</span>
        </span>
      </p>
    </router-link>

    <div class="pagination-controls">
      <div class="pagination">
        <button @click="fetchPreviousPage" :disabled="currentPage === 1" class="button"><span>&lt;</span> Previous</button>
        <span>{{ currentPage }}</span>
        <button @click="fetchNextPage" :disabled="currentPage * pageSize >= totalPitches" class="button">Next <span>&gt;</span></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { DateTime } from 'luxon';

const pitches = ref([]);
let currentPage = ref(1);
const pageSize = 10;
let totalPitches = ref(0);

const fetchPitches = async () => {
  const response = await fetch(`/api/pitch/list?offset=${(currentPage.value - 1) * pageSize}&count=${pageSize}`);
  const data = await response.json();
  pitches.value = data.pitchDecks || [];
  totalPitches.value = data.total || 0;
  sortedPitches.value = sortPitchesByDate(pitches.value);
};

onMounted(fetchPitches);

const sortedPitches = ref([]);

const sortPitchesByDate = (pitches) => {
  return pitches.sort((a, b) => {
    return new Date(a.createdDate) - new Date(b.createdDate);
  });
};

const formatRelativeDate = (dateString) => {
  const date = DateTime.fromSQL(dateString, { zone: 'GMT' });
  return date.toRelativeCalendar();
};

const formatAbsoluteDate = (dateString) => {
  const date = DateTime.fromSQL(dateString, { zone: 'GMT' }).setZone('local');
  return date.setLocale(navigator.language).toLocaleString(DateTime.DATETIME_FULL);
};

const fetchNextPage = async () => {
  currentPage.value++;
  await fetchPitches();
};

const fetchPreviousPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await fetchPitches();
  }
};
</script>

<style scoped>
.pitch-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #222; /* Dark background color */
  color: #fff; /* Text color */
  min-height: 100vh; /* Ensures the container covers the full viewport height */
  padding-top: 20px; /* Add padding at the top for spacing */
}

.pitch-item {
  margin: 5px;
  text-decoration: none; /* Set underline style */
}

.pitch-item:hover {
  text-decoration-style: underline; /* Show underline on hover */
  text-decoration-color: #ccc; /* Adjust underline color */
  text-decoration-thickness: 1px; /* Adjust underline thickness */
}

.pitch-item p {
  margin: 0;
  display: flex;
  align-items: center;
}

.company-name {
  color: #fff;
  font-weight: bold;
}

.date {
  color: #888;
  font-style: italic;
}

.middle-text {
  color: #ccc;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50; /* Material design color for buttons */
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #45a049; /* Darker color on hover */
}

.button span {
  margin: 0 5px;
  margin: 0;
}

.button svg {
  fill: white;
  width: 20px;
  height: 20px;
  vertical-align: middle;
}
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination {
  display: flex;
  align-items: center;
}
</style>
