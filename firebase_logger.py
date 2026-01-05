import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime
from twilio.rest import Client

# -------------------------------
# Twilio Configuration
# -------------------------------
# Replace with your Twilio credentials
TWILIO_ACCOUNT_SID = "AC4760fa3f7a5ed172db348dbe9d5ae817"
TWILIO_AUTH_TOKEN = "aba8561532153b375b7131386d501452"
TWILIO_WHATSAPP_FROM = "whatsapp:+14155238886"  # Twilio sandbox number
TWILIO_WHATSAPP_TO = "whatsapp:+919392569322"  # Your WhatsApp number (with country code)

# Initialize Twilio client
try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    TWILIO_ENABLED = True
except Exception as e:
    print(f"Warning: Twilio not configured: {e}")
    TWILIO_ENABLED = False

# -------------------------------
# Firebase Initialization
# -------------------------------
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(
        cred,
        {
            "databaseURL": "https://seizowatch-default-rtdb.firebaseio.com"
        }
    )

# -------------------------------
# Send WhatsApp Alert
# -------------------------------
def send_whatsapp_alert(event_data):
    """
    Send WhatsApp notification via Twilio when seizure is confirmed
    """
    if not TWILIO_ENABLED:
        return False
    
    try:
        message_body = f"""
SEIZURE ALERT - SeizoWatch

Time: {event_data.get('timestamp', 'N/A')}
Duration: {event_data.get('duration_seconds', 0):.1f} seconds
Confidence: {event_data.get('onnx_score', 0)*100:.0f}%
Status: DL Verified

Immediate attention required!
        """.strip()
        
        message = twilio_client.messages.create(
            body=message_body,
            from_=TWILIO_WHATSAPP_FROM,
            to=TWILIO_WHATSAPP_TO
        )
        
        print(f"WhatsApp alert sent (SID: {message.sid})")
        return True
        
    except Exception as e:
        print(f"WhatsApp alert failed: {e}")
        return False

# -------------------------------
# Log seizure event (history)
# -------------------------------
def log_seizure_event(event_data):
    """
    Push a CONFIRMED seizure event to Firebase
    Path: seizure_events/
    
    Note: Only DL-verified events should be logged here.
    This is the permanent record of confirmed seizures.
    """
    ref = db.reference("seizure_events")
    ref.push(event_data)
    print(f"Event saved to Firebase: seizure_events/")
    
    print(f"Sending WhatsApp alert...")
    alert_sent = send_whatsapp_alert(event_data)
    if not alert_sent:
        print(f"Warning: WhatsApp alert was not sent. Check Twilio configuration.")


# -------------------------------
# Update realtime alert status
# -------------------------------
def update_realtime_alert(active, severity="LOW"):
    """
    Update realtime alert node for live dashboard alerts
    Path: realtime_alert/
    """
    ref = db.reference("realtime_alert")
    ref.set({
        "active": active,
        "severity": severity,
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

# -------------------------------
# Update camera status
# -------------------------------
def update_camera_status(running):
    """
    Update camera status for dashboard
    Path: camera_status/
    """
    ref = db.reference("camera_status")
    ref.set({
        "running": running,
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

# -------------------------------
# Update real-time monitoring data
# -------------------------------
def update_realtime_monitoring(motion_value, dominant_freq, is_rhythmic, avg_motion=0, max_motion=0):
    """
    Update real-time monitoring data for live dashboard
    Path: realtime_monitoring/
    """
    ref = db.reference("realtime_monitoring")
    ref.set({
        "motion_value": float(motion_value),
        "dominant_frequency": float(dominant_freq),
        "rhythmic_motion": is_rhythmic,
        "avg_motion": float(avg_motion),
        "max_motion": float(max_motion),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
