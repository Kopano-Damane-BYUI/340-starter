/* *******************************
 * Inventory Management AJAX Script
 * Updates table dynamically when classification is selected
 ******************************* */

'use strict'

document.addEventListener("DOMContentLoaded", () => {
  const classificationSelect = document.querySelector("#classificationSelect")
  const inventoryDisplay = document.querySelector("#inventoryDisplay")

  if (!classificationSelect) {
    console.error("classificationSelect dropdown not found!")
    return
  }

  // When dropdown changes, fetch inventory data
  classificationSelect.addEventListener("change", function () {
    const classificationId = classificationSelect.value
    if (classificationId) {
      fetch(`/inv/getInventory/${classificationId}`)
        .then(response => response.json())
        .then(data => buildInventoryList(data))
        .catch(err => console.error("Error fetching inventory:", err))
    } else {
      inventoryDisplay.innerHTML = "" // clear table if no selection
    }
  })

  // Build inventory table dynamically
  function buildInventoryList(data) {
    if (!Array.isArray(data) || data.length === 0) {
      inventoryDisplay.innerHTML = "<tr><td>No vehicles found for this classification.</td></tr>"
      return
    }

    let tableData = `
      <thead>
        <tr>
          <th>Make</th>
          <th>Model</th>
          <th>Description</th>
          <th>Price</th>
          <th>Year</th>
          <th>Mileage</th>
          <th>Color</th>
          <th>Modify</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
    `
    data.forEach(vehicle => {
      tableData += `<tr>
        <td>${vehicle.inv_make}</td>
        <td>${vehicle.inv_model}</td>
        <td>${vehicle.inv_description}</td>
        <td>$${vehicle.inv_price}</td>
        <td>${vehicle.inv_year}</td>
        <td>${vehicle.inv_miles}</td>
        <td>${vehicle.inv_color}</td>
        <td><a href='/inv/edit/${vehicle.inv_id}' title='Click to modify'>Modify</a></td>
        <td><a href='/inv/delete/${vehicle.inv_id}' title='Click to delete'>Delete</a></td>
      </tr>`
    })

    tableData += "</tbody>"
    inventoryDisplay.innerHTML = tableData
  }
})
