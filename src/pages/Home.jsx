import { useState, useEffect, useRef } from "react";
import {
  Button,
  Table,
  Card,
  Form,
  Input,
  Select,
  Checkbox,
  Tag,
  Modal,
  ConfigProvider,
  App as AntdApp,
} from "antd";

import { useAuthStore } from "../store/authStore";
import { useNavigate, Navigate } from "react-router-dom";
import { ReloadOutlined } from "@ant-design/icons";

function Home() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const notificationsRef = useRef([]);

  const { message, notification } = AntdApp.useApp();

  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state?.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedRowId, setSelectedRowId] = useState(null);

  async function getNotifications() {
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/kap/disclosures",
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

      setNotifications(data);
      notificationsRef.current = data;

      setCurrentPage(1);
      setSelectedRowId(null);
    } catch (error) {
      console.log(error);
      message.error("Bildirimler alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function checkNewNotifications() {
    try {
      console.log("Yeni bildirim kontrol ediliyor...");

      const response = await fetch(
        "http://localhost:8080/api/kap/disclosures",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("API status:", response.status);

      if (!response.ok) {
        console.log("Bildirim kontrol isteği başarısız.");
        return;
      }

      const data = await response.json();

      console.log("API'den gelen:", data.length);
      console.log("Mevcut kayıt:", notificationsRef.current.length);

      const currentIds = new Set(
        notificationsRef.current.map((notification) =>
          String(notification.disclosureIndex),
        ),
      );

      const newNotifications = data.filter(
        (notification) => !currentIds.has(String(notification.disclosureIndex)),
      );

      console.log("Yeni bildirimler:", newNotifications);

      if (newNotifications.length > 0) {
        setHasNewNotification(true);
        notificationsRef.current = data;
      }
    } catch (error) {
      console.error("Yeni bildirim kontrolü başarısız:", error);
    }
  }

  useEffect(() => {
    if (!token) return;

    getNotifications();

    const interval = setInterval(() => {
      checkNewNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [token]);

  async function createUser(values) {
    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Kullanıcı oluşturulamadı.");
      }

      message.success("Kullanıcı başarıyla oluşturuldu.");
      userForm.resetFields();
      setIsUserModalOpen(false);
    } catch (error) {
      console.log(error);
      message.error("Kullanıcı oluşturulurken hata oluştu.");
    }
  }

  const defaultColumns = [
    {
      title: "#",
      key: "rowNumber",
      width: 60,
      align: "center",
      render: (_, __, index) =>
        notifications.length - ((currentPage - 1) * pageSize + index),
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

  const detailColumns = [
    {
      title: "#",
      key: "rowNumber",
      width: 60,
      align: "center",
      render: (_, __, index) =>
        notifications.length - ((currentPage - 1) * pageSize + index),
    },
    {
      title: "Bildirim Tarihi",
      dataIndex: "publishDate",
      key: "publishDate",
    },

    {
      title: "Bildirim Tipi",
      dataIndex: "disclosureClass",
      key: "disclosureClass",
      render: (type) => <Tag>{type}</Tag>,
    },

    {
      title: "Bildirim Konusu",
      dataIndex: "title",
      key: "title",
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
      title: "Özet Bilgi",
      dataIndex: "summary",
      key: "summary",
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
      align: "center",
    },
    {
      title: "Ek Sayısı",
      dataIndex: "attachmentCount",
      key: "attachmentCount",
      align: "center",
      render: (count) => <Tag>{count ?? 0}</Tag>,
    },
  ];

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleGoHome() {
    setNotifications([]);
    setShowDetails(false);
    setCurrentPage(1);

    navigate("/home");
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="home-page">
      <header className="home-header">
        <div
          className="brand-area"
          style={{ cursor: "pointer" }}
          onClick={() => window.location.reload()}
        >
          <img
            src="/favicon.svg"
            alt="KAP Logo"
            className="kap-logo"
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

        {hasNewNotification && (
          <div
            className="header-notification"
            onClick={() => window.location.reload()}
          >
            <ReloadOutlined className="header-notification-icon" />

            <span>Yeni bildirim var. Yenilemek için tıklayın.</span>
          </div>
        )}

        <div className="user-area">
          <div className="user-info">
            <strong>{user?.userName}</strong>
            <span>{role}</span>
          </div>

          <Button onClick={() => navigate("/him")}>HİM</Button>

          {role === "ADMIN" && (
            <Button
              type="primary"
              onClick={() => setIsUserModalOpen(true)}
              className="add-user-button"
            >
              Kullanıcı Ekle
            </Button>
          )}

          <Button onClick={handleLogout}>Çıkış Yap</Button>
        </div>
      </header>

      <main className="home-content">
        <div className="page-heading">
          <div>
            <span className="page-eyebrow">KAMUYU AYDINLATMA PLATFORMU</span>

            <h1>Şirket Bildirimleri</h1>
          </div>

          <div className="date-box">
            <span>Bugün</span>
            <strong>
              {new Intl.DateTimeFormat("tr-TR", {
                timeZone: "Europe/Istanbul",
              }).format(new Date())}{" "}
            </strong>
          </div>
        </div>

        <Card className="notifications-card">
          <div className="table-toolbar">
            <div className="table-info">
              <h2>Bugünün Bildirimleri</h2>

              <span className="record-count">{notifications.length} kayıt</span>
            </div>

            <div className="table-actions">
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: "#8b1e2d",
                    colorPrimaryHover: "#681520",
                  },
                }}
              >
                <Checkbox
                  checked={showDetails}
                  onChange={(e) => setShowDetails(e.target.checked)}
                >
                  Detaylı Görünüm
                </Checkbox>
              </ConfigProvider>

              <Button
                type="primary"
                onClick={getNotifications}
                loading={loading}
              >
                Bildirimleri Yenile
              </Button>
            </div>
          </div>

          <Table
            dataSource={notifications}
            columns={showDetails ? detailColumns : defaultColumns}
            rowKey="disclosureIndex"
            loading={loading}
            rowClassName={(record) =>
              record.disclosureIndex === selectedRowId
                ? "selected-row"
                : "kap-row"
            }
            onRow={(record) => ({
              onClick: () => {
                setSelectedRowId(record.disclosureIndex);
              },
            })}
            locale={{
              emptyText:
                "Bildirimleri görüntülemek için 'Bildirimleri Yenile' butonuna tıklayın.",
            }}
            sticky={{
              offsetHeader: 76,
            }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["50", "150", "250"],
              showTotal: (total) => `Toplam ${total} bildirim`,

              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </main>
      {role === "ADMIN" && (
        <Modal
          title="Yeni Kullanıcı Oluştur"
          open={isUserModalOpen}
          onCancel={() => {
            setIsUserModalOpen(false);
            userForm.resetFields();
          }}
          footer={null}
          centered
          destroyOnHidden
        >
          <p className="modal-description">
            Sisteme erişim sağlayacak kullanıcı bilgilerini giriniz.
          </p>

          <Form form={userForm} onFinish={createUser} layout="vertical">
            <Form.Item
              label="Kullanıcı Adı"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Kullanıcı adı giriniz.",
                },
              ]}
            >
              <Input placeholder="Kullanıcı adını giriniz" />
            </Form.Item>

            <Form.Item
              label="Şifre"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Şifre giriniz.",
                },
              ]}
            >
              <Input.Password placeholder="Şifre giriniz" />
            </Form.Item>

            <Form.Item
              label="Rol"
              name="role"
              rules={[
                {
                  required: true,
                  message: "Rol seçiniz.",
                },
              ]}
            >
              <Select
                placeholder="Rol seçiniz"
                options={[
                  {
                    value: "USER",
                    label: "USER",
                  },
                  {
                    value: "ADMIN",
                    label: "ADMIN",
                  },
                ]}
              />
            </Form.Item>

            <div className="modal-actions">
              <Button
                onClick={() => {
                  setIsUserModalOpen(false);
                  userForm.resetFields();
                }}
              >
                İptal
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                className="add-user-button"
              >
                Kullanıcı Oluştur
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
}

export default Home;
