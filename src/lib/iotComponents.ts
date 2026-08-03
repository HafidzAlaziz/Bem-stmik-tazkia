import { IconType } from "react-icons";
import { FiCpu, FiWifi, FiDatabase, FiCloud, FiTool, FiActivity, FiRadio, FiZap, FiServer } from "react-icons/fi";
import { FaAws, FaMicrochip } from "react-icons/fa";
import {
  SiArduino, SiRaspberrypi, SiMqtt, SiPython, SiCplusplus,
  SiEspressif, SiNodered, SiGrafana, SiInfluxdb,
} from "react-icons/si";

export interface IoTComponentItem {
  id: string;
  label: string;
  color: string;
  icon: IconType;
  category: "Mikrokontroler" | "Sensor & Aktuator" | "Komunikasi" | "Software & Platform" | "Cloud & Dashboard" | "Protokol";
}

export const IOT_COMPONENTS: IoTComponentItem[] = [
  // Mikrokontroler
  { id: "esp32",        label: "ESP32",                    color: "#E7352B", icon: SiEspressif,  category: "Mikrokontroler" },
  { id: "esp8266",      label: "ESP8266",                  color: "#E7352B", icon: SiEspressif,  category: "Mikrokontroler" },
  { id: "arduino-uno",  label: "Arduino Uno",              color: "#00878A", icon: SiArduino,    category: "Mikrokontroler" },
  { id: "arduino-nano", label: "Arduino Nano",             color: "#00878A", icon: SiArduino,    category: "Mikrokontroler" },
  { id: "arduino-mega", label: "Arduino Mega",             color: "#00878A", icon: SiArduino,    category: "Mikrokontroler" },
  { id: "rpi4",         label: "Raspberry Pi 4",           color: "#C51A4A", icon: SiRaspberrypi, category: "Mikrokontroler" },
  { id: "rpi-zero",     label: "Raspberry Pi Zero",        color: "#C51A4A", icon: SiRaspberrypi, category: "Mikrokontroler" },
  { id: "stm32",        label: "STM32",                    color: "#03234B", icon: FaMicrochip,  category: "Mikrokontroler" },
  { id: "nodemcu",      label: "NodeMCU",                  color: "#1A73E8", icon: FiCpu,        category: "Mikrokontroler" },
  { id: "atmega328",    label: "ATmega328",                color: "#2E7D32", icon: FaMicrochip,  category: "Mikrokontroler" },

  // Sensor & Aktuator
  { id: "dht11",        label: "DHT11",                    color: "#F59E0B", icon: FiActivity,   category: "Sensor & Aktuator" },
  { id: "dht22",        label: "DHT22",                    color: "#D97706", icon: FiActivity,   category: "Sensor & Aktuator" },
  { id: "ds18b20",      label: "DS18B20",                  color: "#DC2626", icon: FiActivity,   category: "Sensor & Aktuator" },
  { id: "ultrasonic",   label: "Sensor Ultrasonik (HC-SR04)", color: "#6366F1", icon: FiRadio,  category: "Sensor & Aktuator" },
  { id: "pir",          label: "Sensor PIR",               color: "#8B5CF6", icon: FiActivity,  category: "Sensor & Aktuator" },
  { id: "ldr",          label: "Sensor LDR",               color: "#EAB308", icon: FiZap,       category: "Sensor & Aktuator" },
  { id: "soil",         label: "Sensor Kelembapan Tanah",  color: "#16A34A", icon: FiActivity,  category: "Sensor & Aktuator" },
  { id: "mq2",          label: "Sensor Gas (MQ-2)",        color: "#B91C1C", icon: FiActivity,  category: "Sensor & Aktuator" },
  { id: "mq135",        label: "Sensor Udara (MQ-135)",    color: "#7C3AED", icon: FiActivity,  category: "Sensor & Aktuator" },
  { id: "servo",        label: "Motor Servo",              color: "#0EA5E9", icon: FiTool,      category: "Sensor & Aktuator" },
  { id: "stepper",      label: "Motor Stepper",            color: "#0891B2", icon: FiTool,      category: "Sensor & Aktuator" },
  { id: "relay",        label: "Relay Module",             color: "#DC2626", icon: FiZap,       category: "Sensor & Aktuator" },
  { id: "buzzer",       label: "Buzzer",                   color: "#F97316", icon: FiRadio,     category: "Sensor & Aktuator" },
  { id: "oled",         label: "OLED Display",             color: "#1D4ED8", icon: FiCpu,       category: "Sensor & Aktuator" },
  { id: "lcd",          label: "LCD 16x2",                 color: "#15803D", icon: FiCpu,       category: "Sensor & Aktuator" },
  { id: "rfid",         label: "RFID RC522",               color: "#0F766E", icon: FiRadio,     category: "Sensor & Aktuator" },
  { id: "fingerprint",  label: "Fingerprint Sensor",       color: "#BE185D", icon: FiActivity,  category: "Sensor & Aktuator" },
  { id: "gps",          label: "GPS Module (NEO-6M)",      color: "#1D4ED8", icon: FiRadio,     category: "Sensor & Aktuator" },

  // Komunikasi
  { id: "wifi",         label: "Wi-Fi",                    color: "#0EA5E9", icon: FiWifi,      category: "Komunikasi" },
  { id: "bluetooth",    label: "Bluetooth / BLE",          color: "#2563EB", icon: FiRadio,     category: "Komunikasi" },
  { id: "zigbee",       label: "Zigbee",                   color: "#7C3AED", icon: FiRadio,     category: "Komunikasi" },
  { id: "lora",         label: "LoRa / LoRaWAN",           color: "#DB2777", icon: FiRadio,     category: "Komunikasi" },
  { id: "rs485",        label: "RS485 / Modbus",           color: "#92400E", icon: FiCpu,       category: "Komunikasi" },
  { id: "i2c",          label: "I2C",                      color: "#374151", icon: FiCpu,       category: "Komunikasi" },
  { id: "spi",          label: "SPI",                      color: "#374151", icon: FiCpu,       category: "Komunikasi" },
  { id: "uart",         label: "UART / Serial",            color: "#374151", icon: FiCpu,       category: "Komunikasi" },
  { id: "gsm",          label: "GSM / SIM800L",            color: "#15803D", icon: FiRadio,     category: "Komunikasi" },

  // Protokol
  { id: "mqtt",         label: "MQTT",                     color: "#660066", icon: SiMqtt,      category: "Protokol" },
  { id: "http-rest",    label: "HTTP / REST API",          color: "#1D4ED8", icon: FiCloud,     category: "Protokol" },
  { id: "websocket",    label: "WebSocket",                color: "#7C3AED", icon: FiWifi,      category: "Protokol" },
  { id: "coap",         label: "CoAP",                     color: "#0F766E", icon: FiRadio,     category: "Protokol" },
  { id: "amqp",         label: "AMQP",                     color: "#DC2626", icon: FiRadio,     category: "Protokol" },

  // Software & Platform
  { id: "arduino-ide",  label: "Arduino IDE",              color: "#00878A", icon: SiArduino,   category: "Software & Platform" },
  { id: "platformio",   label: "PlatformIO",               color: "#F5822A", icon: FiTool,      category: "Software & Platform" },
  { id: "nodered",      label: "Node-RED",                 color: "#8F0000", icon: SiNodered,   category: "Software & Platform" },
  { id: "wokwi",        label: "Wokwi Simulator",          color: "#7C3AED", icon: FiTool,      category: "Software & Platform" },
  { id: "micropython",  label: "MicroPython",              color: "#3776AB", icon: SiPython,    category: "Software & Platform" },
  { id: "python-iot",   label: "Python",                   color: "#3776AB", icon: SiPython,    category: "Software & Platform" },
  { id: "cpp-iot",      label: "C / C++",                  color: "#00599C", icon: SiCplusplus, category: "Software & Platform" },
  { id: "thingsboard",  label: "ThingsBoard",              color: "#0064B0", icon: FiDatabase,  category: "Software & Platform" },
  { id: "grafana",      label: "Grafana",                  color: "#F46800", icon: SiGrafana,   category: "Software & Platform" },
  { id: "influxdb",     label: "InfluxDB",                 color: "#22ADF6", icon: SiInfluxdb,  category: "Software & Platform" },
  { id: "blynk",        label: "Blynk",                    color: "#00C42D", icon: FiDatabase,  category: "Software & Platform" },
  { id: "homeassist",   label: "Home Assistant",           color: "#41BDF5", icon: FiServer,    category: "Software & Platform" },

  // Cloud & Dashboard
  { id: "aws-iot",      label: "AWS IoT Core",             color: "#FF9900", icon: FaAws,       category: "Cloud & Dashboard" },
  { id: "azure-iot",    label: "Azure IoT Hub",            color: "#0078D4", icon: FiCloud,     category: "Cloud & Dashboard" },
  { id: "gcp-iot",      label: "Google Cloud IoT",         color: "#4285F4", icon: FiServer,    category: "Cloud & Dashboard" },
  { id: "firebase-rt",  label: "Firebase Realtime DB",     color: "#FFCA28", icon: FiDatabase,  category: "Cloud & Dashboard" },
  { id: "adafruit-io",  label: "Adafruit IO",              color: "#5C6BC0", icon: FiCloud,     category: "Cloud & Dashboard" },
  { id: "thingspeak",   label: "ThingSpeak",               color: "#0085CA", icon: FiCloud,     category: "Cloud & Dashboard" },
];

export const CATEGORY_COLORS: Record<string, string> = {
  "Mikrokontroler":      "#E7352B",
  "Sensor & Aktuator":   "#F59E0B",
  "Komunikasi":          "#0EA5E9",
  "Protokol":            "#7C3AED",
  "Software & Platform": "#16A34A",
  "Cloud & Dashboard":   "#2563EB",
};

export const getIoTComponent = (label: string) => {
  return IOT_COMPONENTS.find(
    (c) => c.label.toLowerCase() === label.toLowerCase()
  );
};
