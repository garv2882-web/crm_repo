/* 
 * SalesNest CRM Leads Module Controller (Controller Layer)
 * Integrates the presentation HTML elements with the CRMDataStore layer.
 */

// ==========================================
// LEADS MODULE CONTROLLER STATE
// ==========================================
const LeadsState = {
  filters: {
    search: '',
    status: 'all',
    priority: 'all',
    assignedTo: 'all'
  },
  
  pagination: {
    currentPage: 1,
    pageSize: 10
  },
  
  sorting: {
    field: 'created_at',
    order: 'desc'
  },

  // Apply filters, searches, and sorting to the leads array
  getProcessedLeads() {
    let result = CRMDataStore.leads.map(l => CRMDataStore.getJoinedLead(l));

    // Keyword search filter (checks Title, Company Name, Contact Name, Assignee Name)
    if (this.filters.search.trim()) {
      const q = this.filters.search.toLowerCase();
      result = result.filter(l => 
        l.lead_title.toLowerCase().includes(q) ||
        l.company.company_name.toLowerCase().includes(q) ||
        (l.contact.first_name + ' ' + l.contact.last_name).toLowerCase().includes(q) ||
        l.assignedUser.full_name.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (this.filters.status !== 'all') {
      result = result.filter(l => l.lead_status === this.filters.status);
    }

    // Priority filter
    if (this.filters.priority !== 'all') {
      result = result.filter(l => l.priority === this.filters.priority);
    }

    // Assigned To user filter
    if (this.filters.assignedTo !== 'all') {
      result = result.filter(l => l.assigned_to === this.filters.assignedTo);
    }

    // Column Sorting
    const field = this.sorting.field;
    const order = this.sorting.order === 'asc' ? 1 : -1;
    
    result.sort((a, b) => {
      let valA, valB;
      
      if (field === 'company_name') {
        valA = a.company.company_name;
        valB = b.company.company_name;
      } else if (field === 'assigned_to') {
        valA = a.assignedUser.full_name;
        valB = b.assignedUser.full_name;
      } else {
        valA = a[field];
        valB = b[field];
      }

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      
      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * order;
      } else {
        return (valA - valB) * order;
      }
    });

    return result;
  }
};

// ==========================================
// PAGE CONTROLLER BINDINGS
// ==========================================

// Global Nav Menu Dropdown handler (Close all dropdowns on body click)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.action-menu-btn');
  const allDropdowns = document.querySelectorAll('.action-dropdown-list');
  
  if (btn) {
    e.stopPropagation();
    const dropdown = btn.nextElementSibling;
    const isOpen = dropdown.classList.contains('show');
    
    allDropdowns.forEach(d => d.classList.remove('show'));
    if (!isOpen) dropdown.classList.add('show');
  } else {
    allDropdowns.forEach(d => d.classList.remove('show'));
  }
});

// ------------------------------------------
// DASHBOARD CONTROLLER
// ------------------------------------------
function initLeadsDashboard() {
  const tableBody = document.getElementById('leads-table-body');
  const searchInput = document.getElementById('leads-search');
  const statusFilter = document.getElementById('filter-status');
  const priorityFilter = document.getElementById('filter-priority');
  const userFilter = document.getElementById('filter-user');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  
  const createModal = document.getElementById('create-lead-modal');
  const createModalOpenBtn = document.getElementById('btn-open-create-modal');
  const createModalCloseBtn = document.getElementById('btn-close-create-modal');
  const createModalCancelBtn = document.getElementById('btn-cancel-create-modal');
  const createLeadForm = document.getElementById('modal-create-lead-form');

  const companySelect = document.getElementById('form-company');
  const contactSelect = document.getElementById('form-contact');
  const assigneeSelect = document.getElementById('form-assignee');

  if (!tableBody) return; // Not on the dashboard page

  // Populate dynamic select filter options
  if (userFilter) {
    userFilter.innerHTML = '<option value="all">Assigned To</option>';
    CRMDataStore.users.forEach(u => {
      userFilter.innerHTML += `<option value="${u.user_id}">${u.full_name}</option>`;
    });
  }

  // Populate dynamic modal form dropdown inputs
  if (companySelect) {
    companySelect.innerHTML = '<option value="" disabled selected>Select Company</option>';
    CRMDataStore.companies.forEach(c => {
      companySelect.innerHTML += `<option value="${c.company_id}">${c.company_name}</option>`;
    });
  }

  if (contactSelect) {
    contactSelect.innerHTML = '<option value="" disabled selected>Select Primary Contact</option>';
    CRMDataStore.contacts.forEach(p => {
      contactSelect.innerHTML += `<option value="${p.contact_id}">${p.first_name} ${p.last_name}</option>`;
    });
  }

  if (assigneeSelect) {
    assigneeSelect.innerHTML = '<option value="" disabled selected>Select Rep</option>';
    CRMDataStore.users.forEach(u => {
      assigneeSelect.innerHTML += `<option value="${u.user_id}">${u.full_name} (${u.role})</option>`;
    });
  }

  // Render dashboard views
  function render(showLoading = false) {
    if (showLoading) {
      tableBody.innerHTML = `
        <tr class="skeleton-row"><td colspan="8"><div class="skeleton-pulse" style="height: 24px; width: 100%; margin: 8px 0; border-radius: 4px;"></div></td></tr>
        <tr class="skeleton-row"><td colspan="8"><div class="skeleton-pulse" style="height: 24px; width: 100%; margin: 8px 0; border-radius: 4px;"></div></td></tr>
        <tr class="skeleton-row"><td colspan="8"><div class="skeleton-pulse" style="height: 24px; width: 100%; margin: 8px 0; border-radius: 4px;"></div></td></tr>
      `;
      return;
    }

    const processed = LeadsState.getProcessedLeads();
    
    // 1. Calculate KPI metric counts
    document.getElementById('stat-total-val').innerText = CRMDataStore.leads.length;
    document.getElementById('stat-new-val').innerText = CRMDataStore.leads.filter(l => l.lead_status === 'New').length;
    document.getElementById('stat-qualified-val').innerText = CRMDataStore.leads.filter(l => l.lead_status === 'Qualified').length;
    document.getElementById('stat-contacted-val').innerText = CRMDataStore.leads.filter(l => l.lead_status === 'Contacted').length;
    document.getElementById('stat-disqualified-val').innerText = CRMDataStore.leads.filter(l => l.lead_status === 'Disqualified').length;

    // 2. Render Leads table rows
    const totalRecords = processed.length;
    const pageSize = LeadsState.pagination.pageSize;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    
    if (LeadsState.pagination.currentPage > totalPages) {
      LeadsState.pagination.currentPage = totalPages;
    }
    const currentPage = LeadsState.pagination.currentPage;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);
    
    const paginated = processed.slice(startIndex, endIndex);

    tableBody.innerHTML = '';
    
    if (paginated.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8">
            <div style="text-align: center; padding: 48px 24px; color: var(--text-secondary);">
              <div style="font-size: 32px; margin-bottom: 12px; opacity: 0.7;">🔍</div>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">No matching leads found</h3>
              <p style="font-size: 13px; margin-top: 4px;">Try refining your keywords, status, or assignee filters.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      paginated.forEach(lead => {
        const initials = lead.assignedUser.full_name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <a href="lead-details.html?id=${lead.lead_id}" class="lead-title-cell" style="font-weight: 600; color: var(--primary);">${lead.lead_title}</a>
          </td>
          <td>${lead.company.company_name}</td>
          <td>
            <span class="badge badge-status-${lead.lead_status.toLowerCase()}">${lead.lead_status}</span>
          </td>
          <td>
            <span class="badge badge-priority-${lead.priority.toLowerCase()}">${lead.priority}</span>
          </td>
          <td style="font-weight: 600; color: hsl(150, 84%, 26%);">${formatCurrency(lead.estimated_revenue)}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="profile-avatar" style="width: 24px; height: 24px; font-size: 10px; font-weight: 700;">${initials}</div>
              <span>${lead.assignedUser.full_name}</span>
            </div>
          </td>
          <td style="color: var(--text-secondary); font-size: 13px;">${formatDate(lead.created_at)}</td>
          <td style="position: relative;">
            <button class="action-menu-btn" style="background: none; cursor: pointer; color: var(--text-secondary); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">•••</button>
            <ul class="action-dropdown-list" style="position: absolute; right: 20px; top: 32px; background: white; border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 80; min-width: 150px; display: none; list-style: none; padding: 4px 0;">
              <li><a href="lead-details.html?id=${lead.lead_id}" style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500;">👁 View details</a></li>
              <li><button class="btn-convert-deal" data-id="${lead.lead_id}" style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500; width: 100%; text-align: left; background: none;">💼 Convert to deal</button></li>
              <li style="border-top: 1px dashed var(--border-color); margin-top: 4px;"><button class="btn-delete-lead" data-id="${lead.lead_id}" style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500; width: 100%; text-align: left; background: none; color: hsl(357, 85%, 40%);">🗑 Delete lead</button></li>
            </ul>
          </td>
        `;

        row.addEventListener('click', (e) => {
          if (!e.target.closest('a') && !e.target.closest('button') && !e.target.closest('.action-dropdown-list')) {
            window.location.href = `lead-details.html?id=${lead.lead_id}`;
          }
        });

        tableBody.appendChild(row);
      });
    }

    // 3. Render Pagination Controls
    document.getElementById('pagination-summary').innerText = totalRecords > 0 
      ? `Showing ${startIndex + 1} to ${endIndex} of ${totalRecords} results` 
      : 'Showing 0 to 0 of 0 results';

    const pagesContainer = document.getElementById('pagination-pages');
    if (pagesContainer) {
      pagesContainer.innerHTML = '';
      
      const prevBtn = document.createElement('button');
      prevBtn.className = 'page-btn';
      prevBtn.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
      prevBtn.disabled = currentPage === 1;
      prevBtn.addEventListener('click', () => {
        LeadsState.pagination.currentPage--;
        render();
      });
      pagesContainer.appendChild(prevBtn);

      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.innerText = i;
        pageBtn.addEventListener('click', () => {
          LeadsState.pagination.currentPage = i;
          render();
        });
        pagesContainer.appendChild(pageBtn);
      }

      const nextBtn = document.createElement('button');
      nextBtn.className = 'page-btn';
      nextBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.addEventListener('click', () => {
        LeadsState.pagination.currentPage++;
        render();
      });
      pagesContainer.appendChild(nextBtn);
    }

    // 4. Calculate Lead Conversion Rate widget
    const allLeads = CRMDataStore.leads;
    const totalLeadsCount = allLeads.length;
    const convertedLeadsCount = allLeads.filter(l => l.lead_status === 'Converted').length;
    const conversionPercent = totalLeadsCount > 0 ? Math.round((convertedLeadsCount / totalLeadsCount) * 100) : 0;
    
    document.getElementById('conversion-percent-text').innerText = `${conversionPercent}%`;
    document.getElementById('conversion-progress-bar').style.width = `${conversionPercent}%`;
    document.getElementById('conversion-ratio-text').innerText = `${convertedLeadsCount} / ${totalLeadsCount} Leads`;

    // 5. Render Recent Activities list
    const activitiesContainer = document.getElementById('recent-activities-list');
    if (activitiesContainer) {
      activitiesContainer.innerHTML = '';
      const recent = CRMDataStore.activities.slice(0, 5); // display top 5
      
      if (recent.length === 0) {
        activitiesContainer.innerHTML = '<p style="color: var(--text-tertiary); font-size: 13px; font-style: italic;">No recent activities logged.</p>';
      } else {
        recent.forEach(act => {
          let icon = '<i class="fa-solid fa-bell"></i>';
          if (act.action_type === 'create_lead') icon = '<i class="fa-solid fa-user-plus"></i>';
          else if (act.action_type === 'status_update') icon = '<i class="fa-solid fa-rotate"></i>';
          else if (act.action_type === 'convert_lead') icon = '<i class="fa-solid fa-briefcase"></i>';
          else if (act.action_type === 'delete_lead') icon = '<i class="fa-solid fa-trash-can"></i>';
          else if (act.action_type === 'note_added') icon = '<i class="fa-solid fa-pen-nib"></i>';
          
          const timeText = new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + formatDate(act.created_at);
          const item = document.createElement('div');
          item.className = 'activity-item';
          item.innerHTML = `
            <div class="activity-icon-wrap">${icon}</div>
            <div class="activity-details">
              <span class="activity-text">${act.text}</span>
              <span class="activity-time">${timeText}</span>
            </div>
          `;
          activitiesContainer.appendChild(item);
        });
      }
    }
  }

  // Setup dynamic loading transitions
  render(true); // display loading skeletons
  setTimeout(() => {
    render(false); // populate data
  }, 500);

  // Setup filters listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      LeadsState.filters.search = e.target.value;
      LeadsState.pagination.currentPage = 1;
      render();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      LeadsState.filters.status = e.target.value;
      LeadsState.pagination.currentPage = 1;
      render();
    });
  }

  if (priorityFilter) {
    priorityFilter.addEventListener('change', (e) => {
      LeadsState.filters.priority = e.target.value;
      LeadsState.pagination.currentPage = 1;
      render();
    });
  }

  if (userFilter) {
    userFilter.addEventListener('change', (e) => {
      LeadsState.filters.assignedTo = e.target.value;
      LeadsState.pagination.currentPage = 1;
      render();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      LeadsState.filters.search = '';
      LeadsState.filters.status = 'all';
      LeadsState.filters.priority = 'all';
      LeadsState.filters.assignedTo = 'all';
      
      if (searchInput) searchInput.value = '';
      if (statusFilter) statusFilter.value = 'all';
      if (priorityFilter) priorityFilter.value = 'all';
      if (userFilter) userFilter.value = 'all';
      
      LeadsState.pagination.currentPage = 1;
      render();
    });
  }

  // Page size controller
  const pageSizeSelect = document.getElementById('page-size-select');
  if (pageSizeSelect) {
    pageSizeSelect.value = LeadsState.pagination.pageSize;
    pageSizeSelect.addEventListener('change', (e) => {
      LeadsState.pagination.pageSize = parseInt(e.target.value);
      LeadsState.pagination.currentPage = 1;
      render();
    });
  }

  // Column Headers sorting
  document.querySelectorAll('.crm-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.getAttribute('data-sort');
      if (LeadsState.sorting.field === field) {
        LeadsState.sorting.order = LeadsState.sorting.order === 'asc' ? 'desc' : 'asc';
      } else {
        LeadsState.sorting.field = field;
        LeadsState.sorting.order = 'asc';
      }
      
      document.querySelectorAll('.crm-table th i').forEach(icon => {
        icon.className = 'fa-solid fa-sort';
      });
      const icon = th.querySelector('i');
      if (icon) {
        icon.className = LeadsState.sorting.order === 'asc' 
          ? 'fa-solid fa-sort-up' 
          : 'fa-solid fa-sort-down';
      }
      render();
    });
  });

  // Table action buttons click event listeners
  tableBody.addEventListener('click', (e) => {
    // Action: Convert to deal
    const convertBtn = e.target.closest('.btn-convert-deal');
    if (convertBtn) {
      const leadId = convertBtn.getAttribute('data-id');
      CRMDataStore.convertLeadToDeal(leadId);
      render();
    }

    // Action: Delete lead
    const deleteBtn = e.target.closest('.btn-delete-lead');
    if (deleteBtn) {
      if (confirm('Are you sure you want to delete this lead?')) {
        const leadId = deleteBtn.getAttribute('data-id');
        CRMDataStore.deleteLead(leadId);
        render();
      }
    }
  });

  // Modal Open/Close triggers
  const closeModalFn = () => {
    createModal.classList.remove('show');
    if (createLeadForm) createLeadForm.reset();
  };

  if (createModalOpenBtn && createModal) {
    createModalOpenBtn.addEventListener('click', () => {
      createModal.classList.add('show');
    });
  }

  if (createModalCloseBtn && createModal) {
    createModalCloseBtn.addEventListener('click', closeModalFn);
  }

  if (createModalCancelBtn && createModal) {
    createModalCancelBtn.addEventListener('click', closeModalFn);
  }

  // Submit creation form
  if (createLeadForm && createModal) {
    createLeadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = {
        lead_title: document.getElementById('form-title').value,
        lead_source: document.getElementById('form-source').value,
        lead_status: document.getElementById('form-status').value,
        priority: document.getElementById('form-priority').value,
        estimated_revenue: document.getElementById('form-revenue').value,
        conversion_probability: document.getElementById('form-probability').value,
        company_id: document.getElementById('form-company').value,
        primary_contact_id: document.getElementById('form-contact').value,
        assigned_to: document.getElementById('form-assignee').value,
        campaign_name: document.getElementById('form-campaign').value,
        notes: document.getElementById('form-notes').value
      };

      CRMDataStore.addLead(formData);
      createModal.classList.remove('show');
      createLeadForm.reset();
      render();
    });
  }
}

// ------------------------------------------
// STANDALONE CREATION PAGE CONTROLLER
// ------------------------------------------
function initCreatePage() {
  const createLeadForm = document.getElementById('standalone-create-lead-form');
  const companySelect = document.getElementById('form-company');
  const contactSelect = document.getElementById('form-contact');
  const assigneeSelect = document.getElementById('form-assignee');

  if (!createLeadForm) return; // Not on the form page

  // Populate selects
  if (companySelect) {
    companySelect.innerHTML = '<option value="" disabled selected>Select Company</option>';
    CRMDataStore.companies.forEach(c => {
      companySelect.innerHTML += `<option value="${c.company_id}">${c.company_name}</option>`;
    });
  }

  if (contactSelect) {
    contactSelect.innerHTML = '<option value="" disabled selected>Select Primary Contact</option>';
    CRMDataStore.contacts.forEach(p => {
      contactSelect.innerHTML += `<option value="${p.contact_id}">${p.first_name} ${p.last_name}</option>`;
    });
  }

  if (assigneeSelect) {
    assigneeSelect.innerHTML = '<option value="" disabled selected>Select Representative</option>';
    CRMDataStore.users.forEach(u => {
      assigneeSelect.innerHTML += `<option value="${u.user_id}">${u.full_name} (${u.role})</option>`;
    });
  }

  // Handle submit form
  createLeadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
      lead_title: document.getElementById('form-title').value,
      lead_source: document.getElementById('form-source').value,
      lead_status: document.getElementById('form-status').value,
      priority: document.getElementById('form-priority').value,
      estimated_revenue: document.getElementById('form-revenue').value,
      conversion_probability: document.getElementById('form-probability').value,
      company_id: document.getElementById('form-company').value,
      primary_contact_id: document.getElementById('form-contact').value,
      assigned_to: document.getElementById('form-assignee').value,
      campaign_name: document.getElementById('form-campaign').value,
      notes: document.getElementById('form-notes').value
    };

    CRMDataStore.addLead(formData);
    alert('Lead profile successfully created!');
    window.location.href = 'leads-dashboard.html';
  });

  const cancelBtn = document.getElementById('btn-cancel-create');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'leads-dashboard.html';
    });
  }
}

// ------------------------------------------
// DETAILS PAGE CONTROLLER
// ------------------------------------------
function initDetailsPage() {
  const detailsContainer = document.getElementById('lead-details-content-wrapper');
  if (!detailsContainer) return; // Not on the details page

  const urlParams = new URLSearchParams(window.location.search);
  const leadId = urlParams.get('id');
  
  if (!leadId) {
    detailsContainer.innerHTML = `
      <div class="card" style="padding: 40px; text-align: center;">
        <h2 style="font-size: 18px; font-weight: 700;">Error: No Lead ID found</h2>
        <p style="margin: 10px 0 20px 0; color: var(--text-secondary);">Go back to the Leads Dashboard to choose a lead.</p>
        <a href="leads-dashboard.html" class="btn btn-primary">Go to Dashboard</a>
      </div>
    `;
    return;
  }

  const lead = CRMDataStore.leads.find(l => l.lead_id === leadId);
  if (!lead) {
    detailsContainer.innerHTML = `
      <div class="card" style="padding: 40px; text-align: center;">
        <h2 style="font-size: 18px; font-weight: 700;">Error: Lead profile not found</h2>
        <p style="margin: 10px 0 20px 0; color: var(--text-secondary);">This record does not exist or has been deleted.</p>
        <a href="leads-dashboard.html" class="btn btn-primary">Go to Dashboard</a>
      </div>
    `;
    return;
  }

  // Render lead details
  function renderDetails() {
    const joined = CRMDataStore.getJoinedLead(lead);
    
    // Bind Title & Header Badges
    document.getElementById('bind-title').innerText = joined.lead_title;
    
    // Update document page title
    document.title = `${joined.lead_title} | SalesNest`;
    
    // Update breadcrumb sub title
    const breadcrumbSub = document.getElementById('breadcrumb-sub');
    if (breadcrumbSub) breadcrumbSub.innerText = joined.lead_title;

    const statusBadge = document.getElementById('bind-status-badge');
    statusBadge.innerText = joined.lead_status;
    statusBadge.className = `badge badge-status-${joined.lead_status.toLowerCase()}`;
    
    const priorityBadge = document.getElementById('bind-priority-badge');
    priorityBadge.innerText = joined.priority;
    priorityBadge.className = `badge badge-priority-${joined.priority.toLowerCase()}`;

    // Bind Core details
    document.getElementById('bind-source').innerText = joined.lead_source || 'N/A';
    document.getElementById('bind-revenue').innerText = formatCurrency(joined.estimated_revenue);
    document.getElementById('bind-probability').innerText = (joined.conversion_probability !== undefined && joined.conversion_probability !== null)
      ? `${joined.conversion_probability}%` 
      : 'N/A';
    document.getElementById('bind-campaign').innerText = joined.campaign_name || 'N/A';
    document.getElementById('bind-created-date').innerText = formatDate(joined.created_at) + ' (' + new Date(joined.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')';
    document.getElementById('bind-updated-date').innerText = formatDate(joined.updated_at) + ' (' + new Date(joined.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')';

    // Bind Related Company details
    document.getElementById('bind-comp-name').innerText = joined.company.company_name;
    document.getElementById('bind-comp-industry').innerText = joined.company.industry || 'N/A';
    document.getElementById('bind-comp-website').innerText = joined.company.website || 'N/A';
    document.getElementById('bind-comp-website').href = joined.company.website || '#';
    document.getElementById('bind-comp-location').innerText = (joined.company.city || '') + (joined.company.state ? ', ' + joined.company.state : '') + (joined.company.country ? ', ' + joined.company.country : '') || 'N/A';

    // Bind Related Contact details
    document.getElementById('bind-cont-name').innerText = joined.contact.first_name + ' ' + (joined.contact.last_name || '');
    document.getElementById('bind-cont-job').innerText = (joined.contact.job_title || 'Contact') + (joined.contact.department ? ' - ' + joined.contact.department : '');
    document.getElementById('bind-cont-email').innerText = joined.contact.email || 'N/A';
    document.getElementById('bind-cont-email').href = joined.contact.email ? `mailto:${joined.contact.email}` : '#';
    document.getElementById('bind-cont-phone').innerText = joined.contact.mobile_number || 'N/A';

    // Bind Assigned User details
    document.getElementById('bind-user-name').innerText = joined.assignedUser.full_name;
    document.getElementById('bind-user-email').innerText = joined.assignedUser.email || 'N/A';
    document.getElementById('bind-user-role').innerText = joined.assignedUser.role || 'Sales Rep';

    // Render Internal Notes logs
    const notesContainer = document.getElementById('bind-notes-history');
    notesContainer.innerHTML = '';
    
    if (joined.notes) {
      // Split notes by divider string '---' if they exist in chronological order
      const notesList = joined.notes.split('\n---\n');
      notesList.forEach(noteText => {
        const item = document.createElement('div');
        item.className = 'note-bubble';
        item.innerHTML = `
          <p class="note-text" style="font-size: 13.5px; white-space: pre-wrap;">${noteText}</p>
          <div class="note-meta" style="font-size: 11px; color: var(--text-tertiary); margin-top: 6px; text-align: right;">Logged Activity</div>
        </div>
        `;
        notesContainer.appendChild(item);
      });
    } else {
      notesContainer.innerHTML = '<p style="color: var(--text-tertiary); font-size: 13.5px; font-style: italic;">No notes recorded for this lead yet.</p>';
    }

    // Set Quick select values
    const changeStatusSelect = document.getElementById('update-status');
    const changePrioritySelect = document.getElementById('update-priority');
    if (changeStatusSelect) changeStatusSelect.value = joined.lead_status;
    if (changePrioritySelect) changePrioritySelect.value = joined.priority;
  }

  // Setup quick selectors actions
  const changeStatusSelect = document.getElementById('update-status');
  const changePrioritySelect = document.getElementById('update-priority');
  if (changeStatusSelect) {
    changeStatusSelect.addEventListener('change', (e) => {
      CRMDataStore.updateLead(leadId, { lead_status: e.target.value });
      renderDetails();
    });
  }

  if (changePrioritySelect) {
    changePrioritySelect.addEventListener('change', (e) => {
      CRMDataStore.updateLead(leadId, { priority: e.target.value });
      renderDetails();
    });
  }

  // Add notes logs submission handler
  const addNoteForm = document.getElementById('form-add-note');
  if (addNoteForm) {
    addNoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const textInput = document.getElementById('new-note-text');
      const val = textInput.value;
      if (!val.trim()) return;

      const updated = lead.notes 
        ? `${val}\n---\n${lead.notes}` 
        : val;

      CRMDataStore.updateLead(leadId, { notes: updated });
      textInput.value = '';
      renderDetails();
    });
  }

  // Details button: delete lead
  const deleteBtn = document.getElementById('btn-details-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
        CRMDataStore.deleteLead(leadId);
        alert('Lead record successfully deleted.');
        window.location.href = 'leads-dashboard.html';
      }
    });
  }

  // Details button: convert lead
  const convertBtn = document.getElementById('btn-details-convert');
  if (convertBtn) {
    convertBtn.addEventListener('click', () => {
      CRMDataStore.convertLeadToDeal(leadId);
      alert('Lead successfully converted to Deal!');
      renderDetails();
    });
  }

  // Initial load
  renderDetails();
}

// ==========================================
// BOOT BINDINGS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initLeadsDashboard();
  initCreatePage();
  initDetailsPage();
});
