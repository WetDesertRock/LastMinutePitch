<template>
  <div class="container">
    <p class="prompt">Tell me about a</p>
    <div class="input-section">
      <input v-model="companyType" :placeholder="companyTypes[Math.floor(Math.random() * companyTypes.length)]" class="input-box" />
    </div>
    <p class="prompt">named</p>
    <div class="input-section">
      <input v-model="companyName" placeholder="Company Name" class="input-box" />
    </div>
    <div class="button-section">
      <button @click="submitPitch" :disabled="!isDataValid || isLoading" class="generate-button">{{ isLoading ? 'Loading...' : 'Generate Pitch' }}</button>
    </div>
    <div v-if="isLoading" class="spinner-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const companyType = ref('');
const companyName = ref('');
const companyTypes = [
  'Tech Startup', 'Fashion Brand', 'Food Truck', 'Fitness Studio', 'Design Agency'
]; // Placeholder values for companyType input

const isLoading = ref(false);

const isDataValid = computed(() => {
  return companyType.value.trim() !== '' && companyName.value.trim() !== '';
});


const router = useRouter();

const submitPitch = async () => {
  if (isDataValid.value && !isLoading.value) {
    isLoading.value = true;

    const formData = new FormData();
    formData.append('companyType', companyType.value);
    formData.append('companyName', companyName.value);

    try {
      const response = await fetch('/api/pitch', {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const pitchdeckId = data.pitchdeck_id;

        // Navigate to the 'slides' route with the pitchdeck ID
        router.push({ name: 'slides', params: { id: pitchdeckId } });
      } else {
        // Handle error response
        alert('Error submitting pitch. Please try again.');
      }
    } catch (error) {
      // Handle network errors
      alert('Network error. Please try again.');
    } finally {
      isLoading.value = false;
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #333; /* Dark background color */
}

.prompt {
  font-size: 40px;
  color: white;
  margin: 20px 0; /* Equal margin top and bottom */
}

.input-section {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.input-box {
  width: 400px; /* Adjust width as needed */
  height: 60px; /* Adjust height as needed */
  font-size: 24px; /* Adjust font size as needed */
  border-radius: 15px;
  padding: 10px;
  margin: 10px;
  text-align: center; /* Center placeholder text */
}

.generate-button {
  width: 400px; /* Same width as input boxes */
  height: 60px; /* Same height as input boxes */
  font-size: 40px; /* Larger text size */
  border-radius: 15px;
  background-color: #5cb85c; /* Green button color */
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 10px;
}

.generate-button:hover {
  background-color: #4cae4c; /* Darker green on hover */
}
.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.spinner {
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 5px solid #fff;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.generate-button:disabled {
  background-color: #aaa; /* Change background color when disabled */
  color: #666; /* Change text color when disabled */
  cursor: not-allowed; /* Change cursor when disabled */
}
</style>
