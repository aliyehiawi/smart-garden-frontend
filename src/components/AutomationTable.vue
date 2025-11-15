<template>
  <div class="automation-table">
    <div class="table-header">
      <h3>🤖 Automation Rules</h3>
      <button class="btn-add">+ Add Rule</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Rule Name</th>
          <th>Trigger</th>
          <th>Action</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Auto Water Low Moisture</td>
          <td>Moisture < 30%</td>
          <td>Start Pump</td>
          <td><span class="status active">Active</span></td>
          <td>
            <button class="btn-icon">✏️</button>
            <button class="btn-icon">🗑️</button>
          </td>
        </tr>
        <tr>
          <td>High Temperature Alert</td>
          <td>Temp > 35°C</td>
          <td>Send Notification</td>
          <td><span class="status active">Active</span></td>
          <td>
            <button class="btn-icon">✏️</button>
            <button class="btn-icon">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
// Automation logic here
</script>

<style scoped>
.automation-table {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.btn-add {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
}

th {
  text-align: left;
  padding: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

td {
  padding: 1rem 0.75rem;
  border-top: 1px solid #e5e7eb;
  color: #111827;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status.active {
  background: #d1fae5;
  color: #065f46;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin: 0 0.25rem;
}
</style>