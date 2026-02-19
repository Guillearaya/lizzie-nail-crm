import streamlit as st
from datetime import datetime, timedelta

st.set_page_config(page_title="💅 Lizzie Nail CRM", layout="wide")

st.title("💅 LIZZIE NAIL - SISTEMA DE AGENDAMIENTO")

tab1, tab2, tab3 = st.tabs(["📅 AGENDAR CITA", "👥 MI CUENTA", "📊 ADMIN"])

with tab1:
    st.subheader("📅 Agendar tu Cita")
    
    col1, col2 = st.columns(2)
    
    with col1:
        nombre = st.text_input("👤 Nombre completo")
        telefono = st.text_input("📱 Teléfono (WhatsApp)")
        email = st.text_input("📧 Email")
    
    with col2:
        servicio = st.selectbox("🎨 Servicio", [
            "Esmalte Permanente ($25)",
            "Acrílicas ($35)",
            "Acrílicas + Diseño ($45)",
            "Pedicura ($20)"
        ])
    
    st.markdown("---")
    fecha = st.date_input("📅 Fecha")
    hora = st.selectbox("⏰ Hora", ["10:00", "11:00", "14:00", "15:00", "16:00"])
    
    if st.button("✅ CONFIRMAR CITA", type="primary", use_container_width=True):
        if nombre and telefono and email:
            st.success("✅ ¡Cita confirmada!")
            st.balloons()
        else:
            st.error("❌ Completa todos los campos")

with tab2:
    st.subheader("👥 Mi Cuenta")
    email_busqueda = st.text_input("Ingresa tu email")
    st.info("Aquí verás tus citas")

with tab3:
    st.subheader("📊 PANEL ADMINISTRATIVO")
    password = st.text_input("🔐 Contraseña", type="password")
    if password == "lizzie123":
        st.success("✅ Acceso admin")
    elif password:
        st.error("❌ Contraseña incorrecta")
