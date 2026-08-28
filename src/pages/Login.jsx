import { useState } from "react";
import { Card, Input, Button, Form, App as AntdApp } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import "../App.css";

function Login() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const navigate = useNavigate();
  const { message } = AntdApp.useApp();

  const [loginLoading, setLoginLoading] = useState(false);

  async function login(username, password) {
    try {
      setLoginLoading(true);

      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        message.error("Kullanıcı adı veya şifre hatalı.");
        return;
      }

      const data = await response.json();

      const decodedToken = jwtDecode(data.token);

      setAuth(data.token, decodedToken.role, {
        userName: decodedToken.sub,
        companyName: null,
      }); // JWT içerisindeki kullanıcı ve rol bilgilerini global auth store'a kaydeder.

      message.success("Giriş başarılı.");

      navigate("/home");
    } catch (error) {
      console.error("Giriş sırasında hata:", error);

      message.error("Giriş sırasında bir hata oluştu.");
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="left-side">
        <div className="login-logo-box">
          <img src="/favicon.svg" alt="KAP Logo" className="login-logo" />
        </div>

        <div className="left-content">
          <span className="login-eyebrow">KAMUYU AYDINLATMA PLATFORMU</span>

          <h2>Bildirim İzleme ve Filtreleme Modülü</h2>

          <div className="login-title-line" />

          <h1>Hoş Geldiniz</h1>
          
        </div>

        <div className="login-left-footer">
          KAP Bildirim İzleme ve Filtreleme Modülü
        </div>
      </div>

      <div className="right-side">
        <Card className="login-card">
          <div className="login-card-header">
            <span className="login-card-eyebrow">
              KAP BİLDİRİM İZLEME VE FİLTRELEME MODÜLÜ{" "}
            </span>

            <h2>Giriş Yapınız</h2>

            <p>Sisteme erişmek için kullanıcı bilgilerinizi giriniz.</p>
          </div>

          <Form
            layout="vertical"
            requiredMark={false}
            onFinish={(values) => {
              login(values.username, values.password);
            }}
          >
            <Form.Item
              label="Kullanıcı Adı"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Kullanıcı adınızı giriniz.",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Kullanıcı adınızı giriniz"
                prefix={<UserOutlined />}
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="Şifre"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Şifrenizi giriniz.",
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Şifrenizi giriniz"
                prefix={<LockOutlined />}
                autoComplete="current-password"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loginLoading}
              className="login-button"
            >
              Giriş Yap
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default Login;
