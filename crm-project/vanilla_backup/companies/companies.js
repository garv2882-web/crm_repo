/* 
 * SalesNest CRM Companies Module Controller (Controller Layer)
 * Integrates the presentation HTML elements with the CRMDataStore layer.
 */

// ==========================================
// COMPANIES MODULE CONTROLLER STATE
// ==========================================
const CompaniesState = {
  filters: {
    search: '',
    industry: 'all'
  },
  
  pagination: {
    currentPage: 1,
    pageSize: 10
  },
  
  sorting: {
    field: 'created_at',
    order: 'desc'
  },

  // Apply filters, searches, and sorting to the companies array
  getProcessedCompanies() {
    let result = [...CRMDataStore.companies];

    // Keyword search filter (checks Name, Code, Industry, Website, City, State, Country)
    if (this.filters.search.trim()) {
      const q = this.filters.search.toLowerCase();
      result = result.filter(c => 
        c.company_name.toLowerCase().includes(q) ||
        (c.company_code && c.company_code.toLowerCase().includes(q)) ||
        (c.industry && c.industry.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.state && c.state.toLowerCase().includes(q)) ||
        (c.country && c.country.toLowerCase().includes(q))
      );
    }

    // Industry filter
    if (this.filters.industry !== 'all') {
      result = result.filter(c => c.industry === this.filters.industry);
    }

    // Column Sorting
    const field = this.sorting.field;
    const order = this.sorting.order === 'asc' ? 1 : -1;
    
    result.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

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
function initCompaniesDashboard() {
  const tableBody = document.getElementById('companies-table-body');
  const searchInput = document.getElementById('companies-search');
  const industryFilter = document.getElementById('filter-industry');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  
  const createModal = document.getElementById('create-company-modal');
  const createModalOpenBtn = document.getElementById('btn-open-create-modal');
  const createModalCloseBtn = document.getElementById('btn-close-create-modal');
  const createModalCancelBtn = document.getElementById('btn-cancel-create-modal');
  const createCompanyForm = document.getElementById('modal-create-company-form');

  if (!tableBody) return; // Not on the dashboard page

  // Populate dynamic select filter options
  if (industryFilter) {
    const industries = new Set();
    CRMDataStore.companies.forEach(c => {
      if (c.industry && c.industry.trim()) {
        industries.add(c.industry.trim());
      }
    });
    
    industryFilter.innerHTML = '<option value="all">Industry</option>';
    Array.from(industries).sort().forEach(ind => {
      industryFilter.innerHTML += `<option value="${ind}">${ind}</option>`;
    });
  }

  // Render dashboard views
  function render(showLoading = false) {
    if (showLoading) {
      tableBody.innerHTML = `
        <tr class="skeleton-row"><td colspan="6"><div class="skeleton-pulse" style="height: 24px; width: 100%; margin: 8px 0; border-radius: 4px;"></div></td></tr>
        <tr class="skeleton-row"><td colspan="6"><div class="skeleton-pulse" style="height: 24px; width: 100%; margin: 8px 0; border-radius: 4px;"></div></td></tr>
        <tr class="skeleton-row"><td colspan="6"><div class="skeleton-pulse" style="height: 24px; width: 100%; margin: 8px 0; border-radius: 4px;"></div></td></tr>
      `;
      return;
    }

    const processed = CompaniesState.getProcessedCompanies();
    
    // 1. Calculate KPI metric counts
    const totalCompanies = CRMDataStore.companies.length;
    const totalRevenue = CRMDataStore.companies.reduce((sum, c) => sum + (c.annual_revenue || 0), 0);
    const avgRevenue = totalCompanies > 0 ? Math.round(totalRevenue / totalCompanies) : 0;
    
    // Calculate most common industry
    const industryCounts = {};
    let topIndustry = 'N/A';
    let maxCount = 0;
    CRMDataStore.companies.forEach(c => {
      if (c.industry) {
        industryCounts[c.industry] = (industryCounts[c.industry] || 0) + 1;
        if (industryCounts[c.industry] > maxCount) {
          maxCount = industryCounts[c.industry];
          topIndustry = c.industry;
        }
      }
    });

    document.getElementById('stat-total-val').innerText = totalCompanies;
    document.getElementById('stat-revenue-val').innerText = formatCurrency(totalRevenue);
    document.getElementById('stat-industry-val').innerText = topIndustry;
    document.getElementById('stat-avg-revenue-val').innerText = formatCurrency(avgRevenue);

    // 2. Render Companies table rows
    const totalRecords = processed.length;
    const pageSize = CompaniesState.pagination.pageSize;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    
    if (CompaniesState.pagination.currentPage > totalPages) {
      CompaniesState.pagination.currentPage = totalPages;
    }
    const currentPage = CompaniesState.pagination.currentPage;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);
    
    const paginated = processed.slice(startIndex, endIndex);

    tableBody.innerHTML = '';
    
    if (paginated.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div style="text-align: center; padding: 48px 24px; color: var(--text-secondary);">
              <div style="font-size: 32px; margin-bottom: 12px; opacity: 0.7;">🔍</div>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">No matching companies found</h3>
              <p style="font-size: 13px; margin-top: 4px;">Try refining your keywords or industry filters.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      paginated.forEach(comp => {
        const initials = comp.company_name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        const websiteText = comp.website ? comp.website.replace(/^https?:\/\//, '') : '';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="profile-avatar light-blue" style="width: 24px; height: 24px; font-size: 10px; font-weight: 700;">${initials}</div>
              <a href="company-details.html?id=${comp.company_id}" class="lead-title-cell" style="font-weight: 600; color: var(--primary);">${comp.company_name}</a>
            </div>
          </td>
          <td><code>${comp.company_code || 'N/A'}</code></td>
          <td>${comp.industry || 'N/A'}</td>
          <td>
            ${comp.website ? `<a href="${comp.website}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">${websiteText}</a>` : 'N/A'}
          </td>
          <td>${[comp.city, comp.state, comp.country].filter(Boolean).join(', ') || 'N/A'}</td>
          <td style="position: relative;">
            <button class="action-menu-btn" style="background: none; cursor: pointer; color: var(--text-secondary); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">•••</button>
            <ul class="action-dropdown-list" style="position: absolute; right: 20px; top: 32px; background: white; border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 80; min-width: 150px; display: none; list-style: none; padding: 4px 0;">
              <li><a href="company-details.html?id=${comp.company_id}" style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500;">👁 View details</a></li>
              <li style="border-top: 1px dashed var(--border-color); margin-top: 4px;"><button class="btn-delete-company" data-id="${comp.company_id}" style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500; width: 100%; text-align: left; background: none; color: hsl(357, 85%, 40%); border: none; cursor: pointer;">🗑 Delete company</button></li>
            </ul>
          </td>
        `;

        row.addEventListener('click', (e) => {
          if (!e.target.closest('a') && !e.target.closest('button') && !e.target.closest('.action-dropdown-list')) {
            window.location.href = `company-details.html?id=${comp.company_id}`;
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
        CompaniesState.pagination.currentPage--;
        render();
      });
      pagesContainer.appendChild(prevBtn);

      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.innerText = i;
        pageBtn.addEventListener('click', () => {
          CompaniesState.pagination.currentPage = i;
          render();
        });
        pagesContainer.appendChild(pageBtn);
      }

      const nextBtn = document.createElement('button');
      nextBtn.className = 'page-btn';
      nextBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.addEventListener('click', () => {
        CompaniesState.pagination.currentPage++;
        render();
      });
      pagesContainer.appendChild(nextBtn);
    }

    // 4. Render Recent Activities list
    const activitiesContainer = document.getElementById('recent-activities-list');
    if (activitiesContainer) {
      activitiesContainer.innerHTML = '';
      const recent = CRMDataStore.activities.slice(0, 5); // display top 5
      
      if (recent.length === 0) {
        activitiesContainer.innerHTML = '<p style="color: var(--text-tertiary); font-size: 13px; font-style: italic;">No recent activities logged.</p>';
      } else {
        recent.forEach(act => {
          let icon = '<i class="fa-solid fa-bell"></i>';
          if (act.action_type === 'create_company') icon = '<i class="fa-solid fa-building-circle-plus"></i>';
          else if (act.action_type === 'update_company') icon = '<i class="fa-solid fa-building-circle-check"></i>';
          else if (act.action_type === 'delete_company') icon = '<i class="fa-solid fa-building-circle-xmark"></i>';
          else if (act.action_type === 'create_lead') icon = '<i class="fa-solid fa-user-plus"></i>';
          else if (act.action_type === 'status_update') icon = '<i class="fa-solid fa-rotate"></i>';
          else if (act.action_type === 'convert_lead') icon = '<i class="fa-solid fa-briefcase"></i>';
          
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
      CompaniesState.filters.search = e.target.value;
      CompaniesState.pagination.currentPage = 1;
      render();
    });
  }

  if (industryFilter) {
    industryFilter.addEventListener('change', (e) => {
      CompaniesState.filters.industry = e.target.value;
      CompaniesState.pagination.currentPage = 1;
      render();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      CompaniesState.filters.search = '';
      CompaniesState.filters.industry = 'all';
      
      if (searchInput) searchInput.value = '';
      if (industryFilter) industryFilter.value = 'all';
      
      CompaniesState.pagination.currentPage = 1;
      render();
    });
  }

  // Page size controller
  const pageSizeSelect = document.getElementById('page-size-select');
  if (pageSizeSelect) {
    pageSizeSelect.value = CompaniesState.pagination.pageSize;
    pageSizeSelect.addEventListener('change', (e) => {
      CompaniesState.pagination.pageSize = parseInt(e.target.value);
      CompaniesState.pagination.currentPage = 1;
      render();
    });
  }

  // Column Headers sorting
  document.querySelectorAll('.crm-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.getAttribute('data-sort');
      if (CompaniesState.sorting.field === field) {
        CompaniesState.sorting.order = CompaniesState.sorting.order === 'asc' ? 'desc' : 'asc';
      } else {
        CompaniesState.sorting.field = field;
        CompaniesState.sorting.order = 'asc';
      }
      
      document.querySelectorAll('.crm-table th i').forEach(icon => {
        icon.className = 'fa-solid fa-sort';
      });
      const icon = th.querySelector('i');
      if (icon) {
        icon.className = CompaniesState.sorting.order === 'asc' 
          ? 'fa-solid fa-sort-up' 
          : 'fa-solid fa-sort-down';
      }
      render();
    });
  });

  // Table action buttons click event listeners
  tableBody.addEventListener('click', (e) => {
    // Action: Delete company
    const deleteBtn = e.target.closest('.btn-delete-company');
    if (deleteBtn) {
      if (confirm('Are you sure you want to delete this company?')) {
        const companyId = deleteBtn.getAttribute('data-id');
        CRMDataStore.deleteCompany(companyId);
        render();
      }
    }
  });

  // Modal Open/Close triggers
  const closeModalFn = () => {
    createModal.classList.remove('show');
    if (createCompanyForm) createCompanyForm.reset();
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
  if (createCompanyForm && createModal) {
    createCompanyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = {
        company_name: document.getElementById('form-name').value,
        company_code: document.getElementById('form-code').value,
        industry: document.getElementById('form-industry').value,
        website: document.getElementById('form-website').value,
        annual_revenue: document.getElementById('form-revenue').value,
        city: document.getElementById('form-city').value,
        state: document.getElementById('form-state').value,
        country: document.getElementById('form-country').value,
        notes: document.getElementById('form-notes').value
      };

      CRMDataStore.addCompany(formData);
      createModal.classList.remove('show');
      createCompanyForm.reset();
      
      // Update industry options
      const industries = new Set();
      CRMDataStore.companies.forEach(c => {
        if (c.industry && c.industry.trim()) {
          industries.add(c.industry.trim());
        }
      });
      if (industryFilter) {
        industryFilter.innerHTML = '<option value="all">Industry</option>';
        Array.from(industries).sort().forEach(ind => {
          industryFilter.innerHTML += `<option value="${ind}">${ind}</option>`;
        });
      }

      render();
    });
  }
}

// ------------------------------------------
// STANDALONE CREATION PAGE CONTROLLER
// ------------------------------------------
function initCreateCompanyPage() {
  const createCompanyForm = document.getElementById('standalone-create-company-form');

  if (!createCompanyForm) return; // Not on the form page

  // Handle submit form
  createCompanyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
      company_name: document.getElementById('form-name').value,
      company_code: document.getElementById('form-code').value,
      industry: document.getElementById('form-industry').value,
      website: document.getElementById('form-website').value,
      annual_revenue: document.getElementById('form-revenue').value,
      city: document.getElementById('form-city').value,
      state: document.getElementById('form-state').value,
      country: document.getElementById('form-country').value,
      notes: document.getElementById('form-notes').value
    };

    CRMDataStore.addCompany(formData);
    alert('Company profile successfully created!');
    window.location.href = 'companies-dashboard.html';
  });

  const cancelBtn = document.getElementById('btn-cancel-create');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'companies-dashboard.html';
    });
  }
}

// ------------------------------------------
// DETAILS PAGE CONTROLLER
// ------------------------------------------
function initCompanyDetailsPage() {
  const detailsContainer = document.getElementById('company-details-content-wrapper');
  if (!detailsContainer) return; // Not on the details page

  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('id');
  
  if (!companyId) {
    detailsContainer.innerHTML = `
      <div class="card" style="padding: 40px; text-align: center;">
        <h2 style="font-size: 18px; font-weight: 700;">Error: No Company ID found</h2>
        <p style="margin: 10px 0 20px 0; color: var(--text-secondary);">Go back to the Companies Dashboard to choose a company.</p>
        <a href="companies-dashboard.html" class="btn btn-primary">Go to Dashboard</a>
      </div>
    `;
    return;
  }

  const company = CRMDataStore.companies.find(c => c.company_id === companyId);
  if (!company) {
    detailsContainer.innerHTML = `
      <div class="card" style="padding: 40px; text-align: center;">
        <h2 style="font-size: 18px; font-weight: 700;">Error: Company profile not found</h2>
        <p style="margin: 10px 0 20px 0; color: var(--text-secondary);">This record does not exist or has been deleted.</p>
        <a href="companies-dashboard.html" class="btn btn-primary">Go to Dashboard</a>
      </div>
    `;
    return;
  }

  // Render company details
  function renderDetails() {
    // Bind Title & Header Badges
    document.getElementById('bind-title').innerText = company.company_name;
    
    // Update document page title
    document.title = `${company.company_name} | SalesNest`;
    
    // Update breadcrumb sub title
    const breadcrumbSub = document.getElementById('breadcrumb-sub');
    if (breadcrumbSub) breadcrumbSub.innerText = company.company_name;

    const codeBadge = document.getElementById('bind-code-badge');
    codeBadge.innerText = company.company_code || 'N/A';
    
    const industryBadge = document.getElementById('bind-industry-badge');
    industryBadge.innerText = company.industry || 'General';

    // Bind Core details
    document.getElementById('bind-code').innerText = company.company_code || 'N/A';
    document.getElementById('bind-industry').innerText = company.industry || 'N/A';
    
    const webLink = document.getElementById('bind-website-link');
    if (company.website) {
      webLink.innerText = company.website.replace(/^https?:\/\//, '');
      webLink.href = company.website;
      webLink.style.display = 'inline';
    } else {
      webLink.innerText = 'N/A';
      webLink.href = '#';
    }

    document.getElementById('bind-revenue').innerText = formatCurrency(company.annual_revenue);
    document.getElementById('bind-location').innerText = [company.city, company.state, company.country].filter(Boolean).join(', ') || 'N/A';
    document.getElementById('bind-created-date').innerText = formatDate(company.created_at) + ' (' + new Date(company.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')';
    document.getElementById('bind-updated-date').innerText = formatDate(company.updated_at) + ' (' + new Date(company.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')';

    // Pre-populate quick inputs
    const industryInput = document.getElementById('update-industry');
    const revenueInput = document.getElementById('update-revenue');
    const websiteInput = document.getElementById('update-website');
    if (industryInput && !industryInput.value) industryInput.value = company.industry || '';
    if (revenueInput && !revenueInput.value) revenueInput.value = company.annual_revenue || '';
    if (websiteInput && !websiteInput.value) websiteInput.value = company.website || '';

    // Render internal notes logs
    const notesContainer = document.getElementById('bind-notes-history');
    notesContainer.innerHTML = '';
    
    if (company.notes) {
      const notesList = company.notes.split('\n---\n');
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
      notesContainer.innerHTML = '<p style="color: var(--text-tertiary); font-size: 13.5px; font-style: italic;">No notes recorded for this company yet.</p>';
    }

    // Render associated contacts
    const contactsBody = document.getElementById('associated-contacts-table-body');
    const associatedContacts = CRMDataStore.contacts.filter(c => c.company_id === companyId);
    contactsBody.innerHTML = '';
    
    if (associatedContacts.length === 0) {
      contactsBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-tertiary); font-style: italic; padding: 16px;">No associated contacts.</td></tr>';
    } else {
      associatedContacts.forEach(cont => {
        contactsBody.innerHTML += `
          <tr>
            <td style="font-weight: 600; color: var(--primary);">${cont.first_name} ${cont.last_name || ''}</td>
            <td>${cont.email || 'N/A'}</td>
            <td>${cont.job_title || 'N/A'}</td>
          </tr>
        `;
      });
    }

    // Render associated leads
    const leadsBody = document.getElementById('associated-leads-table-body');
    const associatedLeads = CRMDataStore.leads.filter(l => l.company_id === companyId);
    leadsBody.innerHTML = '';
    
    if (associatedLeads.length === 0) {
      leadsBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-tertiary); font-style: italic; padding: 16px;">No associated leads.</td></tr>';
    } else {
      associatedLeads.forEach(lead => {
        leadsBody.innerHTML += `
          <tr>
            <td><a href="../leads/lead-details.html?id=${lead.lead_id}" style="font-weight: 600; color: var(--primary); text-decoration: underline;">${lead.lead_title}</a></td>
            <td><span class="badge badge-status-${lead.lead_status.toLowerCase()}">${lead.lead_status}</span></td>
            <td><span class="badge badge-priority-${lead.priority.toLowerCase()}">${lead.priority}</span></td>
          </tr>
        `;
      });
    }

    // Render associated deals
    const dealsBody = document.getElementById('associated-deals-table-body');
    const associatedDeals = CRMDataStore.deals.filter(d => d.company_id === companyId);
    dealsBody.innerHTML = '';
    
    if (associatedDeals.length === 0) {
      dealsBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-tertiary); font-style: italic; padding: 16px;">No associated deals.</td></tr>';
    } else {
      associatedDeals.forEach(deal => {
        dealsBody.innerHTML += `
          <tr>
            <td style="font-weight: 600; color: var(--primary);">${deal.deal_name}</td>
            <td><span class="badge badge-status-new">${deal.deal_stage}</span></td>
            <td style="font-weight: 600; color: hsl(150, 84%, 26%);">${formatCurrency(deal.deal_value)}</td>
          </tr>
        `;
      });
    }
  }

  // Setup quick operations save button
  const saveOpsBtn = document.getElementById('btn-save-operations');
  if (saveOpsBtn) {
    saveOpsBtn.addEventListener('click', () => {
      const updatedFields = {
        industry: document.getElementById('update-industry').value,
        annual_revenue: parseFloat(document.getElementById('update-revenue').value) || 0,
        website: document.getElementById('update-website').value
      };
      
      CRMDataStore.updateCompany(companyId, updatedFields);
      alert('Company changes saved successfully!');
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

      const updated = company.notes 
        ? `${val}\n---\n${company.notes}` 
        : val;

      CRMDataStore.updateCompany(companyId, { notes: updated });
      textInput.value = '';
      renderDetails();
    });
  }

  // Details button: delete company
  const deleteBtn = document.getElementById('btn-details-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
        CRMDataStore.deleteCompany(companyId);
        alert('Company record successfully deleted.');
        window.location.href = 'companies-dashboard.html';
      }
    });
  }

  // Initial load
  renderDetails();
}

// ==========================================
// BOOT BINDINGS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initCompaniesDashboard();
  initCreateCompanyPage();
  initCompanyDetailsPage();
});
