#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

// Set WiFi credentials
#define WIFI_SSID "DT4G"
#define WIFI_PASS "iuytrewq"
#define UDP_PORT 4210

// UDP
WiFiUDP UDP;
char packet[255];
char reply[16];  // = "Packet received!";

void setup() {
  // Setup serial port
  Serial.begin(115200);
  Serial.println();

  // Begin WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  // Connecting to WiFi...
  Serial.print("Connecting to ");
  Serial.print(WIFI_SSID);
  // Loop continuously while WiFi is not connected
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }

  // Connected to WiFi
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());

  // Begin listening to UDP port
  UDP.begin(UDP_PORT);
  Serial.print("Listening on UDP port ");
  Serial.println(UDP_PORT);
}

void loop() {

  // If packet received...
  int packetSize = UDP.parsePacket();
  if (packetSize) {
    Serial.print("Received packet! Size: ");
    Serial.println(packetSize);
    int len = UDP.read(packet, 255);
    if (len > 0) {
      packet[len] = '\0';
    }
    Serial.print("Packet received: ");
    Serial.println(packet);

    // Send return packet
    Serial.println(UDP.remoteIP());
    Serial.println(UDP.remotePort());
    delay(1000);
    int mil;
    for (int i = 0; i < 50; i++) {
      UDP.beginPacket(UDP.remoteIP(), UDP.remotePort());
      mil=millis();
      // reply[0] = (int)(mil / 10000) + '0';
      // reply[1] = (int)(mil / 1000) + '0';
      // reply[2] = (int)(mil / 100) + '0';
      // reply[3] = (int)(mil / 10) + '0';
      // reply[4] = (int)(mil % 10) + '0';
      itoa(mil, reply, 10);
      Serial.println(reply);
      UDP.write(reply);
      UDP.endPacket();
      // delayMicroseconds(10);
    }
  }
}