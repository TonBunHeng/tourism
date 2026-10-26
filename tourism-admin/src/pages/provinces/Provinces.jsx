import { useState, useEffect } from 'react';
import { Landmark } from 'lucide-react';
import SimplePagination from '../../components/common/SimplePagination';
import ProvincesHeader from './ProvincesHeader';
import ProvincesStats from './ProvincesStats';
import ProvincesToolbar from './ProvincesToolbar';
import ProvincesList from './ProvincesList';
import ProvinceDetailsModal from './ProvinceDetailsModal';
import ProvinceModal from './ProvinceModal';
import provinceService from '../../services/provinceService';
import deletionRequestService from '../../services/deletionRequestService';
import authService, { isSuperAdminRole } from '../../services/authService';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import { getPageCache, setPageCache } from '../../utils/pageCache';

const PROVINCE_TYPES = ['All', 'Capital City', 'Province', 'Municipality'];

export default function Provinces() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm, setSearchTerm } = useSearch();
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = isSuperAdminRole(currentUser?.role);
  const cachedData = getPageCache('provinces_data');
  const [provinces, setProvinces] = useState(() => cachedData?.provinces || []);
  const [isLoading, setIsLoading] = useState(() => !cachedData);

  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProvince, setEditingProvince] = useState(null);
  const [viewingProvince, setViewingProvince] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(() => cachedData?.totalRecords || 0);
  const [totalPages, setTotalPages] = useState(() => cachedData?.totalPages || 1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    type: 'Province',
    population: '',
    area: '',
    districts_count: 0,
    communes_count: 0,
    status: 'Active',
    description: ''
  });

  const loadProvinces = async () => {
    if (!getPageCache('provinces_data')) setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedType !== 'All') params.type = selectedType;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await provinceService.getProvinces(params);
      if (res && (res.success || Array.isArray(res.data) || res.data)) {
        const rawItems = Array.isArray(res.data)
          ? res.data
          : (Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res) ? res : []));

        const formatted = rawItems.map(p => ({
          ...p,
          districts: p.districts_count ?? p.districts ?? 0,
          communes: p.communes_count ?? p.communes ?? 0,
          places: p.places_count ?? p.places ?? 0,
          icon: Landmark,
        }));
        setProvinces(formatted);

        const meta = res.meta || res.data?.meta;
        const total = meta ? (meta.total || formatted.length) : formatted.length;
        const pages = meta ? (meta.last_page || 1) : 1;
        setTotalRecords(total);
        setTotalPages(pages);
        setPageCache('provinces_data', { provinces: formatted, totalRecords: total, totalPages: pages });
      }
    } catch (e) {
      console.error('Failed to load provinces from API', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadProvinces();
  }, [currentPage, searchTerm, selectedType, selectedStatus]);

  const handleSearchChange = (val) => { setSearchTerm(val); setCurrentPage(1); };
  const handleTypeChange = (val) => { setSelectedType(val); setCurrentPage(1); };
  const handleStatusChange = (val) => { setSelectedStatus(val); setCurrentPage(1); };

  const handleView = (provinceOrId) => {
    if (!provinceOrId) return;
    if (typeof provinceOrId === 'object' && provinceOrId.name) {
      setViewingProvince(provinceOrId);
      return;
    }
    const targetId = typeof provinceOrId === 'object' ? provinceOrId.id : provinceOrId;
    const provToView = provinces.find(prov => String(prov.id) === String(targetId)) || (typeof provinceOrId === 'object' ? provinceOrId : null);
    if (provToView) {
      setViewingProvince(provToView);
    }
  };

  const handleDelete = async (id) => {
    const targetId = typeof id === 'object' ? id.id : id;
    const province = provinces.find(p => String(p.id) === String(targetId)) || (typeof id === 'object' ? id : null);
    const provName = province?.name || `Province #${targetId}`;

    if (isSuperAdmin) {
      const confirmed = await showConfirm({
        title: 'Delete Province',
        message: `Are you sure you want to permanently delete province "${provName}"?\n\nThis action cannot be undone.`,
        confirmText: 'Delete Permanently',
        type: 'danger'
      });

      if (!confirmed) return;

      try {
        await provinceService.deleteProvince(targetId);
        showSuccess(`Province "${provName}" has been permanently deleted.`, 'Province Deleted');
        loadProvinces();
      } catch (e) {
        showError(e.message || 'Failed to delete province.', 'Delete Failed');
      }
      return;
    }

    const confirmed = await showConfirm({
      title: 'Submit Deletion Request',
      message: `Are you sure you want to submit a deletion request for province "${provName}"?\n\nThis will be submitted to the Super Administrator for review and approval.`,
      confirmText: 'Submit Deletion',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await deletionRequestService.createRequest({
        request_type: 'item',
        reason: `Request to delete province: ${provName}`,
        urgency: 'high',
        items: [{
          item_type: 'province',
          item_id: targetId,
          item_name: provName,
          category: 'Province'
        }]
      });
      showSuccess(`Deletion request for "${provName}" has been submitted to Super Admin for approval.`, 'Request Submitted');
    } catch (e) {
      showError(e.message || 'Failed to submit deletion request.', 'Submission Failed');
    }
  };

  const openAddModal = () => {
    setEditingProvince(null);
    setFormData({
      name: '',
      type: 'Province',
      population: '',
      area: '',
      districts_count: 0,
      communes_count: 0,
      status: 'Active',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (province) => {
    if (!province) return;
    const provObj = (typeof province === 'object' && province.name)
      ? province
      : provinces.find(p => String(p.id) === String(typeof province === 'object' ? province.id : province));
    if (!provObj) return;

    setEditingProvince(provObj);
    setFormData({
      name: provObj.name || '',
      type: provObj.type || 'Province',
      population: provObj.population || '',
      area: provObj.area || '',
      districts_count: provObj.districts || provObj.districts_count || 0,
      communes_count: provObj.communes || provObj.communes_count || 0,
      status: provObj.status || 'Active',
      description: provObj.description || ''
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingProvince(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingProvince) {
        await provinceService.updateProvince(editingProvince.id, formData);
        showSuccess(`Province "${formData.name}" has been updated successfully.`, 'Province Updated');
      } else {
        await provinceService.createProvince(formData);
        showSuccess(`Province "${formData.name}" has been created successfully.`, 'Province Created');
      }
      closeModal();
      loadProvinces();
    } catch (e) {
      showError(e.message || 'Failed to save province.', 'Save Failed');
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + provinces.length, totalRecords);

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <ProvincesHeader onOpenAddModal={openAddModal} />

      {/* Stats Cards */}
      <ProvincesStats provinces={provinces} />

      {/* Main Content Card */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        <ProvincesToolbar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          provinceTypes={PROVINCE_TYPES}
        />

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-zinc-400 font-medium">
            Loading provinces from API...
          </div>
        ) : (
          <ProvincesList
            provinces={provinces}
            onViewProvince={handleView}
            onEditProvince={openEditModal}
            onDeleteProvince={handleDelete}
            startIndex={startIndex}
          />
        )}

        {/* Simple Pagination Footer */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
          label="provinces"
        />
      </div>

      {/* View Details Modal */}
      <ProvinceDetailsModal
        province={viewingProvince}
        onClose={() => setViewingProvince(null)}
        onEditProvince={openEditModal}
      />

      {/* Add / Edit Province Modal */}
      <ProvinceModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        editingProvince={editingProvince}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        provinceTypes={PROVINCE_TYPES}
      />
    </div>
  );
}
