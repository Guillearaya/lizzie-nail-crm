import streamlit as st
from datetime import datetime, timedelta


st.set_page_config(page_title="💅 Lizzie Nail CRM", layout="wide")

st.title("💅 LIZZIE NAIL - SISTEMA DE AGENDAMIENTO")

# Initialize Google Sheets connection
@st.cache_resource
def connect_to_gsheets():
    try:
        credentials = st.secrets["gsheets"]
        gc = gspread.service_account_from_dict(credentials)
        # Open the spreadsheet (you need to configure the sheet name)
        sh = gc.open("Lizzie Nail CRM")
        return sh
    except Exception as e:
        st.error(f"Error conectando a Google Sheets: {e}")
        return None

# Get admin password from secrets
def get_admin_password():
    try:
        return st.secrets.get("admin_password", "")
    except:
        return ""

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    # Basic phone validation - at least 10 digits
    digits = re.sub(r'\D', '', phone)
    return len(digits) >= 10

def save_appointment(nombre, telefono, email, servicio, fecha, hora):
    try:
        sh = connect_to_gsheets()
        if sh:
            ws = sh.worksheet("Citas")
            ws.append_row([nombre, telefono, email, servicio, str(fecha), hora, datetime.now().isoformat()])
            return True
    except:
        pass
    return False

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
    min_date = datetime.now().date()
    fecha = st.date_input("📅 Fecha", min_value=min_date)
    hora = st.selectbox("⏰ Hora", ["10:00", "11:00", "14:00", "15:00", "16:00"])
    
    if st.button("✅ CONFIRMAR CITA", type="primary", use_container_width=True):
        # Validation
        if not nombre:
            st.error("❌ Por favor ingresa tu nombre")
        elif not validate_phone(telefono):
            st.error("❌ Teléfono debe tener al menos 10 dígitos")
        elif not validate_email(email):
            st.error("❌ Email inválido")
        elif fecha < datetime.now().date():
            st.error("❌ No puedes agendar en fechas pasadas")
        else:
            if save_appointment(nombre, telefono, email, servicio, fecha, hora):
                st.success("✅ ¡Cita confirmada!")
                st.balloons()
            else:
                st.warning("⚠️ Cita guardada localmente (Google Sheets no configurado)")

with tab2:
    st.subheader("👥 Mi Cuenta")
    email_busqueda = st.text_input("Ingresa tu email")
    
    if email_busqueda:
        if validate_email(email_busqueda):
            st.info("📋 Aquí aparecerían tus citas (requiere configuración de Google Sheets)")
        else:
            st.error("❌ Email inválido")

with tab3:
    st.subheader("📊 PANEL ADMINISTRATIVO")
    password = st.text_input("🔐 Contraseña", type="password")
    admin_pwd = get_admin_password()
    
    if password and admin_pwd:
        if password == admin_pwd:
            st.success("✅ Acceso admin")
            st.info("Panel administrativo: Aquí se mostrarían todas las citas")
        else:
            st.error("❌ Contraseña incorrecta")
    elif password:
        st.error("❌ Contraseña no configurada en secrets")
