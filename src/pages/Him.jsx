import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

import {
  Button,
  Modal,
  Tabs,
  Select,
  Transfer,
  Spin,
  DatePicker,
  Table,
  Input,
  Checkbox,
  Popconfirm,
  Tag,
  App as AntdApp,
} from "antd";

const { RangePicker } = DatePicker;

const getTodayIstanbul = () => {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return dayjs(today);
}; // İstanbul saat dilimine göre bugünün tarihini DatePicker'ın kullanabileceği dayjs nesnesine dönüştürür.

function Him() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state?.user);
  const logout = useAuthStore((state) => state.logout);
  const { message } = AntdApp.useApp();

  const navigate = useNavigate();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [filterName, setFilterName] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(true);
  const [dateRange, setDateRange] = useState(() => {
    const today = getTodayIstanbul();

    return [today, today];
  }); // Başlangıç ve bitiş tarihini varsayılan olarak bugün yapar.

  const [companyType, setCompanyType] = useState(undefined);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [selectedCompanyKeys, setSelectedCompanyKeys] = useState([]); // Seçilen şirketlerin mkkMemberOid değerlerini tutar.

  const [allDisclosures, setAllDisclosures] = useState([]);
  const [filteredDisclosures, setFilteredDisclosures] = useState([]);
  const [disclosureLoading, setDisclosureLoading] = useState(false);

  const [selectedCompanies, setSelectedCompanies] = useState([]); // Farklı şirket tiplerinden seçilen şirketleri ortak sepette tutar.

  const [allCurrentPage, setAllCurrentPage] = useState(1);
  const [filteredCurrentPage, setFilteredCurrentPage] = useState(1);

  const [savedFilters, setSavedFilters] = useState([]);
  const [selectedSavedFilterId, setSelectedSavedFilterId] = useState(null);

  const [selectedTopics, setSelectedTopics] = useState([]); // Farklı bildirim tiplerinden seçilen konuları ortak sepette tutar.

  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loadLoading, setLoadLoading] = useState(false);

  const [disclosureType, setDisclosureType] = useState(undefined);
  const [companyDisclosureTopics, setCompanyDisclosureTopics] = useState([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [selectedTopicKeys, setSelectedTopicKeys] = useState([]); // Seçilen bildirim konularının objId değerlerini tutar.
  const [consolidatedOnly, setConsolidatedOnly] = useState(false);
  const [hasAppliedFilter, setHasAppliedFilter] = useState(false); // Kullanıcının en az bir kez filtre uygulayıp uygulamadığını tutar.

  const resetFilterModal = () => {
    setFilterName("");
    setIsFilterActive(true);

    const today = getTodayIstanbul();
    setDateRange([today, today]); // Popup tekrar açıldığında tarihleri bugüne döndürür.

    setCompanyType(undefined);

    setCompanyType(undefined);
    setAvailableCompanies([]);
    setSelectedCompanyKeys([]);
    setSelectedCompanies([]);

    setDisclosureType(undefined);
    setCompanyDisclosureTopics([]);
    setSelectedTopicKeys([]);
    setSelectedTopics([]);
    setConsolidatedOnly(false);

    setSelectedSavedFilterId(null);
  };

  const handleCloseFilterModal = () => {
    resetFilterModal(); // Popup içinde yapılan seçimleri başlangıç durumuna getirir.
    setIsFilterModalOpen(false);
  };

  const existingFilter = savedFilters.find(
    (filter) =>
      filter.filterName.toLocaleLowerCase("tr-TR") ===
      filterName.trim().toLocaleLowerCase("tr-TR"),
  );

  const isApplyDisabled =
    !dateRange || dateRange.length !== 2 || selectedCompanyKeys.length === 0; // Tarih aralığı veya şirket seçimi eksikse filtre uygulama butonunu pasif tutar.

  const pageSize = 50;

  async function getCompanies() {
    try {
      setCompanyLoading(true);

      const response = await fetch(
        `http://localhost:8080/api/him/kapmembers/${companyType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Şirketler alınamadı.");
      }

      const data = await response.json();
      setAvailableCompanies(data);
    } catch (error) {
      console.error("Şirket listesi alınırken hata:", error);
      message.error("Şirket listesi alınamadı.");
    } finally {
      setCompanyLoading(false);
    }
  }

  async function getSavedFilters() {
    try {
      const response = await fetch("http://localhost:8080/api/him/filters", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Kayıtlı filtreler alınamadı.");
      }

      const data = await response.json();

      setSavedFilters(data);
    } catch (error) {
      console.error("Kayıtlı filtreler alınırken hata:", error);
      message.error("Kayıtlı filtreler alınamadı.");
    }
  }

  async function getCompanyDisclosureTopics(type) {
    try {
      setTopicLoading(true);

      const response = await fetch(
        `http://localhost:8080/api/him/company/disclosure-topics/${type}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Bildirim konuları alınamadı.");
      }

      const data = await response.json();

      setCompanyDisclosureTopics(data);
    } catch (error) {
      console.error("Bildirim konuları alınırken hata:", error);
      message.error("Bildirim konuları alınamadı.");
    } finally {
      setTopicLoading(false);
    }
  }
  function handleLoadSavedFilter() {
    if (!selectedSavedFilterId) {
      message.warning("Lütfen kayıtlı bir filtre seçiniz.");
      return;
    }

    setLoadLoading(true);

    const selectedFilter = savedFilters.find(
      (filter) => filter.id === selectedSavedFilterId,
    );

    if (!selectedFilter) {
      setLoadLoading(false);
      message.error("Seçilen filtre bulunamadı.");
      return;
    }

    setFilterName(selectedFilter.filterName);
    setIsFilterActive(selectedFilter.active);

    setCompanyType(selectedFilter.companyType || undefined);
    setSelectedCompanyKeys(selectedFilter.companyOids ?? []);

    const loadedTopics = (selectedFilter.topics ?? []).map((topic) => ({
      key: topic.topicOid,
      objId: topic.topicOid,
      title: topic.topicTitle,
      disclosureType: topic.disclosureType,
      consolidationMethod: topic.consolidationMethod,
    })); // Kayıtlı bildirim konularını Transfer sepetinin kullandığı yapıya dönüştürür.

    setSelectedTopics(loadedTopics);
    setSelectedTopicKeys(loadedTopics.map((topic) => topic.key));

    if (loadedTopics.length > 0) {
      setDisclosureType(loadedTopics[0].disclosureType);
    } else {
      setDisclosureType(undefined);
    }

    setConsolidatedOnly(Boolean(selectedFilter.consolidatedOnly));

    setLoadLoading(false);

    message.success("Filtre yüklendi.");
  }

  async function handleDeleteSavedFilter() {
    if (!selectedSavedFilterId) {
      message.warning("Lütfen silinecek filtreyi seçiniz.");
      return;
    }

    try {
      setDeleteLoading(true);

      const response = await fetch(
        `http://localhost:8080/api/him/filters/${selectedSavedFilterId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Filtre silinemedi.");
      }

      setSelectedSavedFilterId(null);
      setFilterName("");
      setIsFilterActive(true);
      setSelectedCompanyKeys([]);
      setSelectedCompanies([]);

      await getSavedFilters(); // Silme işleminden sonra Select listesini DB'den tekrar günceller.

      message.success("Filtre başarıyla silindi.");
    } catch (error) {
      console.error("Filtre silinirken hata:", error);
      message.error("Filtre silinirken hata oluştu.");
    } finally {
      setDeleteLoading(false);
    }
  }

  useEffect(() => {
    if (isFilterModalOpen && token && companyType) {
      getCompanies();
    }
  }, [companyType, isFilterModalOpen, token]);

  useEffect(() => {
    if (isFilterModalOpen && token) {
      getSavedFilters();
    }
  }, [isFilterModalOpen]);

  function handleCompanyTypeChange(value) {
    setCompanyType(value);
  }

  function handleDisclosureTypeChange(value) {
    setDisclosureType(value);
    getCompanyDisclosureTopics(value);
  }

  const currentCompanyData = availableCompanies.map((company) => ({
    key: company.mkkMemberOid,
    mkkMemberOid: company.mkkMemberOid,
    title: company.stockCode
      ? `${company.stockCode} - ${company.kapMemberTitle}`
      : company.kapMemberTitle,
    stockCode: company.stockCode,
    kapMemberTitle: company.kapMemberTitle,
  }));

  const companyTransferData = Array.from(
    new Map(
      [...currentCompanyData, ...selectedCompanies].map((company) => [
        company.key,
        company,
      ]),
    ).values(),
  ); // Sol liste değişse bile daha önce seçilen şirketleri Transfer içinde tutar.

  function handleCompanyTransferChange(newTargetKeys) {
    setSelectedCompanyKeys(newTargetKeys);

    setSelectedCompanies((previousCompanies) => {
      const previousCompanyMap = new Map(
        previousCompanies.map((company) => [company.key, company]),
      );

      const currentCompanyMap = new Map(
        currentCompanyData.map((company) => [company.key, company]),
      );

      return newTargetKeys
        .map((key) => currentCompanyMap.get(key) || previousCompanyMap.get(key))
        .filter(Boolean);
    });
  }

  async function handleApplyFilter() {
    if (!dateRange || dateRange.length !== 2) {
      message.warning("Lütfen tarih aralığı seçiniz.");
      return;
    }

    if (selectedCompanyKeys.length === 0) {
      message.warning("Lütfen en az bir şirket seçiniz.");
      return;
    }

    const startDate = dateRange[0].format("DD.MM.YYYY");
    const endDate = dateRange[1].format("DD.MM.YYYY"); // Tarihleri KAP API'nin beklediği formata çevirir.

    try {
      setDisclosureLoading(true);

      const response = await fetch(
        `http://localhost:8080/api/him/disclosures?startDate=${encodeURIComponent(
          startDate,
        )}&endDate=${encodeURIComponent(endDate)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Bildirimler alınamadı.");
      }

      const data = await response.json();

      const uniqueDisclosures = Array.from(
        new Map(data.map((item) => [item.disclosureIndex, item])).values(),
      ); // Aynı disclosureIndex'e sahip mükerrer bildirimleri tek kayda düşürür.

      setAllDisclosures(uniqueDisclosures);

      const filtered = uniqueDisclosures.filter((disclosure) => {
        const companyMatches = selectedCompanyKeys.includes(
          disclosure.mkkMemberOid,
        );

        const topicMatches =
          selectedTopicKeys.length === 0 ||
          selectedTopicKeys.includes(disclosure.taxonomySetOid); // Seçilen konu objId değerini bildirimin taxonomySetOid değeriyle eşleştirir.

        return companyMatches && topicMatches;
      });

      setFilteredDisclosures(filtered);
      setHasAppliedFilter(true);

      setAllCurrentPage(1);
      setFilteredCurrentPage(1);

      handleCloseFilterModal();

      message.success("Filtre başarıyla uygulandı.");
    } catch (error) {
      console.error("Bildirimler alınırken hata:", error);
      message.error("Bildirimler getirilirken hata oluştu.");
    } finally {
      setDisclosureLoading(false);
    }
  }

  async function handleSaveFilter() {
    if (!filterName.trim()) {
      message.warning("Filtreyi kaydetmek için filtre adı giriniz.");
      return;
    }

    if (selectedCompanyKeys.length === 0) {
      message.warning("Lütfen en az bir şirket seçiniz.");
      return;
    }

    const existingFilter = savedFilters.find(
      (filter) =>
        filter.filterName.toLocaleLowerCase("tr-TR") ===
        filterName.trim().toLocaleLowerCase("tr-TR"),
    );

    if (existingFilter) {
      const oldCompanyOids = [...(existingFilter.companyOids ?? [])].sort();
      const newCompanyOids = [...selectedCompanyKeys].sort();

      const companiesChanged =
        oldCompanyOids.length !== newCompanyOids.length ||
        oldCompanyOids.some((oid, index) => oid !== newCompanyOids[index]);

      const oldTopicOids = (existingFilter.topics ?? [])
        .map((topic) => topic.topicOid)
        .sort();

      const newTopicOids = selectedTopics.map((topic) => topic.objId).sort();

      const topicsChanged =
        oldTopicOids.length !== newTopicOids.length ||
        oldTopicOids.some((oid, index) => oid !== newTopicOids[index]);

      const consolidatedChanged =
        Boolean(existingFilter.consolidatedOnly) !== consolidatedOnly;

      const activeChanged = Boolean(existingFilter.active) !== isFilterActive;

      const companyTypeChanged =
        (existingFilter.companyType ?? null) !== (companyType ?? null);
      // Filtrenin aktiflik veya şirket tipi bilgisi tek başına değişse bile güncelleme yapılmasını sağlar.

      if (
        !companiesChanged &&
        !topicsChanged &&
        !consolidatedChanged &&
        !activeChanged &&
        !companyTypeChanged
      ) {
        message.warning("Filtrede herhangi bir değişiklik yapılmadı.");
        return;
      }
    }

    const filterData = {
      filterName: filterName.trim(),
      active: isFilterActive,
      companyType,
      companyOids: selectedCompanyKeys,

      topics: selectedTopics.map((topic) => ({
        topicOid: topic.objId,
        topicTitle: topic.title,
        disclosureType: topic.disclosureType,
        consolidationMethod: topic.consolidationMethod,
      })), // Topic sepetini backend'in request DTO yapısına dönüştürür.

      consolidatedOnly,
    };

    try {
      setSaveLoading(true);

      const response = await fetch("http://localhost:8080/api/him/filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(filterData),
      });

      if (!response.ok) {
        throw new Error("Filtre kaydedilemedi.");
      }

      const savedFilter = await response.json();

      setSelectedSavedFilterId(savedFilter.id);

      await getSavedFilters();

      if (existingFilter) {
        message.success("Filtre başarıyla güncellendi.");
      } else {
        message.success("Filtre başarıyla kaydedildi.");
      }
    } catch (error) {
      console.error("Filtre kaydedilirken hata:", error);
      message.error("Filtre kaydedilirken hata oluştu.");
    } finally {
      setSaveLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleTopicTransferChange(newTargetKeys) {
    setSelectedTopicKeys(newTargetKeys);

    setSelectedTopics((previousTopics) => {
      const previousTopicMap = new Map(
        previousTopics.map((topic) => [topic.key, topic]),
      );

      const currentTopicMap = new Map(
        currentTopicData.map((topic) => [topic.key, topic]),
      );

      return newTargetKeys
        .map((key) => currentTopicMap.get(key) || previousTopicMap.get(key))
        .filter(Boolean);
    });
  }

  const currentTopicData = companyDisclosureTopics
    .filter((topic) => !consolidatedOnly || topic.consolidationMethod === "CS")
    .map((topic) => ({
      key: topic.objId,
      objId: topic.objId,
      title: topic.title,
      disclosureType: disclosureType,
      consolidationMethod: topic.consolidationMethod,
    })); // Sepete eklenen konunun hangi bildirim tipine ait olduğunu da tutar.
  const companyDisclosureTopicData = Array.from(
    new Map(
      [...currentTopicData, ...selectedTopics].map((topic) => [
        topic.key,
        topic,
      ]),
    ).values(),
  ); // Bildirim tipi değişse bile daha önce seçilen konuları Transfer içinde tutar.

  const getDisclosureColumns = (currentPage, dataLength) => [
    {
      title: "#",
      key: "rowNumber",
      width: 60,
      align: "center",
      render: (_, __, index) =>
        dataLength - ((currentPage - 1) * pageSize + index),
    },
    {
      title: "Bildirim Tarihi",
      dataIndex: "publishDate",
      key: "publishDate",
      width: 135,
    },
    {
      title: "Bildirim Tipi",
      dataIndex: "disclosureClass",
      key: "disclosureClass",
      width: 100,
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: "Bildirim Konusu",
      dataIndex: "title",
      key: "title",
      width: 420,
      render: (text, record) => (
        <a
          href={`https://kap.org.tr/tr/Bildirim/${record.disclosureIndex}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      ),
    },
    {
      title: "İlgili Şirket",
      dataIndex: "companyTitle",
      key: "companyTitle",
      render: (text, record) => (
        <a
          href={`https://www.kap.org.tr/tr/sirket-bilgileri/ozet/${record.mkkMemberOid}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Bildirim ID",
      dataIndex: "disclosureIndex",
      key: "disclosureIndex",
      width: 105,
      align: "center",
    },
    {
      title: "Ek Sayısı",
      dataIndex: "attachmentCount",
      key: "attachmentCount",
      width: 80,
      align: "center",
      render: (count) => <Tag>{count ?? 0}</Tag>,
    },
  ];

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div
          className="brand-area"
          onClick={() => {
            window.location.href = "/home";
          }}
          style={{ cursor: "pointer" }}
        >
          <img
            src="/favicon.svg"
            alt="KAP Logo"
            style={{
              width: "96px",
              height: "86px",
              objectFit: "contain",
              display: "block",
              flexShrink: 0,
            }}
          />
          <div>
            <h2>KAP Bildirim İzleme ve Filtreleme Modülü</h2>
            <span>Kamuyu Aydınlatma Platformu</span>
          </div>
        </div>

        <div className="user-area">
          <div className="user-info">
            <strong>{user?.userName}</strong>
            <span>{role}</span>
          </div>

          <Button onClick={() => navigate("/home")}>Bildirimler</Button>

          <Button onClick={handleLogout}>Çıkış Yap</Button>
        </div>
      </header>

      <main className="home-content him-content">
        <div className="page-heading">
          <div>
            <span className="page-eyebrow">HABER İZLEME MODÜLÜ</span>

            <div className="date-box">
              <span>Bugün</span>
              <strong>
                {new Intl.DateTimeFormat("tr-TR", {
                  timeZone: "Europe/Istanbul",
                }).format(new Date())}{" "}
              </strong>
            </div>
          </div>

          <Button
            type="primary"
            className="add-user-button"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filtre Yönetimi
          </Button>
        </div>

        <div className="him-tables">
          <div className="notifications-card him-table-card">
            <div className="table-toolbar him-table-toolbar">
              <div className="table-info">
                <h2>Tüm Bildirimler</h2>

                <span className="record-count">
                  {allDisclosures.length} kayıt
                </span>
              </div>
            </div>

            <Table
              columns={getDisclosureColumns(
                allCurrentPage,
                allDisclosures.length,
              )}
              dataSource={allDisclosures}
              rowKey="disclosureIndex"
              size="small"
              pagination={{
                current: allCurrentPage,
                pageSize: pageSize,
                showSizeChanger: false,
                placement: "bottomRight",
                onChange: (page) => setAllCurrentPage(page),
              }}
              scroll={{
                y: "calc((100vh - 500px) / 2)",
              }}
              locale={{
                emptyText: "Henüz bildirim getirilmedi.",
              }}
            />
          </div>

          <div className="notifications-card him-table-card">
            <div className="table-toolbar him-table-toolbar">
              <div className="table-info">
                <h2>Filtrelenmiş Bildirimler</h2>

                <span className="record-count">
                  {filteredDisclosures.length} kayıt
                </span>
              </div>
            </div>

            <Table
              columns={getDisclosureColumns(
                filteredCurrentPage,
                filteredDisclosures.length,
              )}
              dataSource={filteredDisclosures}
              rowKey="disclosureIndex"
              size="small"
              pagination={{
                current: filteredCurrentPage,
                pageSize: pageSize,
                showSizeChanger: false,
                placement: "bottomRight",
                onChange: (page) => setFilteredCurrentPage(page),
              }}
              scroll={{
                y: "calc((100vh - 500px) / 2)",
              }}
              locale={{
                emptyText: hasAppliedFilter
                  ? "Seçilen kriterlere uygun bildirim bulunamadı."
                  : "Henüz bir filtre uygulanmadı.",
              }}
            />
          </div>
        </div>
      </main>

      <Modal
        title="Filtre Yönetimi"
        open={isFilterModalOpen}
        onCancel={handleCloseFilterModal}
        centered
        width={900}
        footer={[
          <Button key="cancel" onClick={handleCloseFilterModal}>
            İptal
          </Button>,

          <Button key="save" loading={saveLoading} onClick={handleSaveFilter}>
            Kaydet
          </Button>,

          <Button
            key="apply"
            type="primary"
            loading={disclosureLoading}
            disabled={isApplyDisabled}
            onClick={handleApplyFilter}
          >
            Filtreyi Uygula
          </Button>,
        ]}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1.4fr auto",
            gap: "20px",
            alignItems: "end",
            marginBottom: "24px",
            padding: "16px 20px",
            background: "#f7f7f8",
            border: "1px solid #e3e5e8",
            borderRadius: "6px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Kayıtlı Filtreler
            </label>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <Select
                value={selectedSavedFilterId}
                onChange={(value) => setSelectedSavedFilterId(value)}
                placeholder="Kayıtlı filtre seçiniz"
                style={{ flex: 1 }}
                options={savedFilters.map((filter) => ({
                  value: filter.id,
                  label: filter.filterName,
                }))}
              />

              <Button
                onClick={handleLoadSavedFilter}
                loading={loadLoading}
                disabled={
                  !selectedSavedFilterId ||
                  saveLoading ||
                  deleteLoading ||
                  loadLoading
                }
              >
                Yükle
              </Button>

              <Popconfirm
                title="Filtreyi sil"
                description="Bu filtreyi silmek istediğinize emin misiniz?"
                okText="Evet, Sil"
                cancelText="Vazgeç"
                onConfirm={handleDeleteSavedFilter}
                disabled={!selectedSavedFilterId}
              >
                <Button
                  danger
                  loading={deleteLoading}
                  disabled={
                    !selectedSavedFilterId ||
                    saveLoading ||
                    deleteLoading ||
                    loadLoading
                  }
                >
                  Sil
                </Button>
              </Popconfirm>
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Filtre Adı
            </label>

            <Input
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Filtre adı giriniz"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Bildirim Tarih Aralığı
            </label>

            <RangePicker
              format="DD.MM.YYYY"
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              allowClear={false}
              placeholder={["Başlangıç Tarihi", "Bitiş Tarihi"]}
              style={{ width: "100%" }}
            />
          </div>

          <div
            style={{
              height: "32px",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            <Checkbox
              checked={isFilterActive}
              onChange={(e) => setIsFilterActive(e.target.checked)}
            >
              Aktif
            </Checkbox>
          </div>
        </div>

        <Tabs
          items={[
            {
              key: "companies",
              label: "Şirketler",

              children: (
                <div>
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: 600,
                      }}
                    >
                      Şirket Tipi
                    </label>

                    <Select
                      value={companyType}
                      onChange={handleCompanyTypeChange}
                      placeholder="Şirket tipi seçiniz"
                      style={{ width: "100%" }}
                      options={[
                        {
                          value: "IGS",
                          label: "BIST Şirketleri",
                        },
                        {
                          value: "YK",
                          label: "Yatırım Kuruluşları",
                        },
                        {
                          value: "PYS",
                          label: "Portföy Yönetim Şirketleri",
                        },
                        {
                          value: "BDK",
                          label: "Bağımsız Denetim Kuruluşları",
                        },
                        {
                          value: "DCS",
                          label: "Derecelendirme Şirketleri",
                        },
                        {
                          value: "DS",
                          label: "Değerleme Şirketleri",
                        },
                        {
                          value: "DK",
                          label:
                            "Diğer KAP Üyeleri ve İşlem Görmeyen Şirketler",
                        },
                      ]}
                    />
                  </div>

                  {companyLoading ? (
                    <div
                      style={{
                        minHeight: "380px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Spin description="Şirketler yükleniyor..." />
                    </div>
                  ) : (
                    <Transfer
                      dataSource={companyTransferData}
                      targetKeys={selectedCompanyKeys}
                      onChange={handleCompanyTransferChange}
                      render={(item) => item.title}
                      titles={[
                        `Kullanılabilir Şirketler (${availableCompanies.length})`,
                        `Seçili Şirketler (${selectedCompanyKeys.length})`,
                      ]}
                      showSearch
                      filterOption={(inputValue, item) =>
                        item.title
                          .toLocaleLowerCase("tr-TR")
                          .includes(inputValue.toLocaleLowerCase("tr-TR"))
                      }
                      styles={{
                        section: {
                          width: 400,
                          height: 380,
                        },
                      }}
                    />
                  )}
                </div>
              ),
            },

            {
              key: "funds",
              label: "Fonlar",
              children: <div>Fon filtreleri burada olacak.</div>,
            },

            {
              key: "companySubjects",
              label: "Şirket Bildirim Konuları",

              children: (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "end",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                        }}
                      >
                        Bildirim Tipi
                      </label>

                      <Select
                        value={disclosureType}
                        onChange={handleDisclosureTypeChange}
                        placeholder="Bildirim tipi seçiniz"
                        style={{ width: "100%" }}
                        options={[
                          {
                            value: "FR",
                            label: "Finansal Rapor",
                          },
                          {
                            value: "ODA",
                            label: "Özel Durum Açıklaması",
                          },
                          {
                            value: "DUY",
                            label: "Düzenleyici Kurum Bildirimleri",
                          },
                          {
                            value: "DG",
                            label: "Diğer",
                          },
                          {
                            value: "HK",
                            label: "Hak Kullanımları",
                          },
                          {
                            value: "ALL",
                            label: "Tümü",
                          },
                        ]}
                      />
                    </div>

                    <Checkbox
                      checked={consolidatedOnly}
                      onChange={(e) => setConsolidatedOnly(e.target.checked)}
                    >
                      Konsolide Olanlar
                    </Checkbox>
                  </div>

                  {topicLoading ? (
                    <div
                      style={{
                        minHeight: "380px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Spin description="Bildirim konuları yükleniyor..." />
                    </div>
                  ) : (
                    <Transfer
                      dataSource={companyDisclosureTopicData}
                      targetKeys={selectedTopicKeys}
                      onChange={handleTopicTransferChange}
                      render={(item) => item.title}
                      titles={[
                        `Kullanılabilir Konular (${companyDisclosureTopicData.length})`,
                        `Seçili Konular (${selectedTopicKeys.length})`,
                      ]}
                      showSearch
                      filterOption={(inputValue, item) =>
                        item.title
                          .toLocaleLowerCase("tr-TR")
                          .includes(inputValue.toLocaleLowerCase("tr-TR"))
                      }
                      styles={{
                        section: {
                          width: 400,
                          height: 380,
                        },
                      }}
                    />
                  )}
                </div>
              ),
            },

            {
              key: "fundSubjects",
              label: "Fon Bildirim Konuları",
              children: <div>Fon bildirim konuları burada olacak.</div>,
            },
          ]}
        />
      </Modal>
    </div>
  );
}

export default Him;
