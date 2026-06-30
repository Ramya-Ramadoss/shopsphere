package com.shopsphere.serviceImpl;

import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import com.shopsphere.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Override
    public void sendOrderConfirmationEmail(Order order) {
        log.info("Generating order confirmation HTML email for order ID: {}", order.getId());
        
        String customerName = order.getCustomer() != null ? order.getCustomer().getFullName() : "Valued Customer";
        String customerEmail = order.getCustomer() != null ? order.getCustomer().getEmail() : "customer@example.com";
        String orderIdStr = order.getId().toString();
        
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy, hh:mm a");
        String orderDateStr = order.getOrderDate() != null ? order.getOrderDate().format(dateFormatter) : "N/A";
        
        DateTimeFormatter estDateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
        String estDeliveryDate = order.getExpectedDeliveryDate() != null ? order.getExpectedDeliveryDate().format(estDateFormatter) : "N/A";
        
        BigDecimal subtotal = order.getTotalAmount();
        BigDecimal taxes = subtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shipping = order.getDeliveryCharge() != null ? order.getDeliveryCharge() : BigDecimal.ZERO;
        BigDecimal grandTotal = subtotal.add(taxes).add(shipping).setScale(2, RoundingMode.HALF_UP);
        
        // Build items rows
        StringBuilder itemsHtml = new StringBuilder();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                String name = item.getProduct() != null ? item.getProduct().getProductName() : "Unknown Item";
                String sku = item.getProduct() != null ? item.getProduct().getSku() : "N/A";
                itemsHtml.append("<tr>")
                        .append("<td style='padding: 12px; border-bottom: 1px solid #edf2f7;'>")
                        .append("<div style='font-weight: 600; color: #1a202c;'>").append(name).append("</div>")
                        .append("<div style='font-size: 12px; color: #718096;'>SKU: ").append(sku).append("</div>")
                        .append("</td>")
                        .append("<td style='padding: 12px; border-bottom: 1px solid #edf2f7; text-align: center; color: #4a5568;'>")
                        .append(item.getQuantity())
                        .append("</td>")
                        .append("<td style='padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; color: #4a5568;'>")
                        .append("₹").append(item.getUnitPrice())
                        .append("</td>")
                        .append("<td style='padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: 600; color: #1a202c;'>")
                        .append("₹").append(item.getSubtotal())
                        .append("</td>")
                        .append("</tr>");
            }
        }

        // Beautiful HTML Template
        String htmlContent = "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset='utf-8'>\n" +
                "  <title>Order Confirmation - ShopSphere</title>\n" +
                "</head>\n" +
                "<body style='font-family: \"Outfit\", \"Inter\", Helvetica, Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 20px;'>\n" +
                "  <table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;'>\n" +
                "    <!-- Header -->\n" +
                "    <tr>\n" +
                "      <td style='background: linear-gradient(135deg, #2563eb, #0d9488); padding: 40px 20px; text-align: center;'>\n" +
                "        <h1 style='color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;'>Shop<span style='color: #2dd4bf;'>Sphere</span></h1>\n" +
                "        <p style='color: #e2e8f0; margin: 8px 0 0 0; font-size: 14px;'>Order Confirmed & Processing</p>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "    \n" +
                "    <!-- Greeting -->\n" +
                "    <tr>\n" +
                "      <td style='padding: 30px 30px 20px 30px;'>\n" +
                "        <h2 style='color: #1a202c; margin: 0; font-size: 20px; font-weight: 700;'>Thank you for your purchase, " + customerName + "!</h2>\n" +
                "        <p style='color: #4a5568; font-size: 15px; line-height: 1.6; margin: 10px 0 0 0;'>We have received your order and are preparing it for shipment. Below are your order summary and tracking details.</p>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "    \n" +
                "    <!-- Order Info Grid -->\n" +
                "    <tr>\n" +
                "      <td style='padding: 0 30px;'>\n" +
                "        <table width='100%' style='background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #edf2f7;'>\n" +
                "          <tr>\n" +
                "            <td width='50%' style='padding-bottom: 12px; vertical-align: top;'>\n" +
                "              <div style='font-size: 12px; font-weight: bold; color: #a0aec0; uppercase; letter-spacing: 0.5px;'>ORDER NUMBER</div>\n" +
                "              <div style='font-size: 14px; font-weight: bold; color: #2d3748;'>#" + orderIdStr + "</div>\n" +
                "            </td>\n" +
                "            <td width='50%' style='padding-bottom: 12px; vertical-align: top;'>\n" +
                "              <div style='font-size: 12px; font-weight: bold; color: #a0aec0; uppercase; letter-spacing: 0.5px;'>ORDER DATE</div>\n" +
                "              <div style='font-size: 14px; color: #2d3748;'>" + orderDateStr + "</div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td width='50%' style='padding-bottom: 12px; vertical-align: top;'>\n" +
                "              <div style='font-size: 12px; font-weight: bold; color: #a0aec0; uppercase; letter-spacing: 0.5px;'>PAYMENT METHOD</div>\n" +
                "              <div style='font-size: 14px; color: #2d3748;'>" + (order.getPayment() != null ? order.getPayment().getPaymentMethod() : "COD") + "</div>\n" +
                "            </td>\n" +
                "            <td width='50%' style='padding-bottom: 12px; vertical-align: top;'>\n" +
                "              <div style='font-size: 12px; font-weight: bold; color: #a0aec0; uppercase; letter-spacing: 0.5px;'>SHIPPING OPTION</div>\n" +
                "              <div style='font-size: 14px; color: #2d3748;'>" + order.getDeliveryMethod() + "</div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td width='50%' style='vertical-align: top;'>\n" +
                "              <div style='font-size: 12px; font-weight: bold; color: #a0aec0; uppercase; letter-spacing: 0.5px;'>EXPECTED ARRIVAL</div>\n" +
                "              <div style='font-size: 14px; font-weight: bold; color: #319795;'>" + estDeliveryDate + "</div>\n" +
                "              <div style='font-size: 12px; color: #718096;'>" + (order.getEstimatedArrivalTime() != null ? order.getEstimatedArrivalTime() : "10:00 AM - 06:00 PM") + "</div>\n" +
                "            </td>\n" +
                "            <td width='50%' style='vertical-align: top;'>\n" +
                "              <div style='font-size: 12px; font-weight: bold; color: #a0aec0; uppercase; letter-spacing: 0.5px;'>TRACKING ID</div>\n" +
                "              <div style='font-size: 14px; font-weight: bold; color: #2b6cb0;'>" + (order.getTrackingId() != null ? order.getTrackingId() : "TRK-PENDING") + "</div>\n" +
                "              <div style='font-size: 12px; color: #718096;'>Partner: " + (order.getCourierPartner() != null ? order.getCourierPartner() : "ShopSphere Logistics") + "</div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td colspan='2' style='padding-top: 15px; border-top: 1px solid #e2e8f0; margin-top: 10px; vertical-align: top;'>\n" +
                "              <div style='font-size: 12px; font-weight: bold; color: #a0aec0; uppercase; letter-spacing: 0.5px;'>SHIPPING ADDRESS</div>\n" +
                "              <div style='font-size: 14px; color: #2d3748;'>" + (order.getShippingAddress() != null ? order.getShippingAddress() : "Customer registered address") + "</div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "    \n" +
                "    <!-- Items list -->\n" +
                "    <tr>\n" +
                "      <td style='padding: 30px;'>\n" +
                "        <h3 style='color: #1a202c; margin: 0 0 12px 0; font-size: 16px; font-weight: 700;'>Items Purchased</h3>\n" +
                "        <table width='100%' style='border-collapse: collapse;'>\n" +
                "          <thead>\n" +
                "            <tr style='background-color: #f7fafc;'>\n" +
                "              <th style='padding: 10px 12px; border-bottom: 2px solid #edf2f7; text-align: left; font-size: 12px; color: #718096;'>PRODUCT</th>\n" +
                "              <th style='padding: 10px 12px; border-bottom: 2px solid #edf2f7; text-align: center; font-size: 12px; color: #718096;'>QTY</th>\n" +
                "              <th style='padding: 10px 12px; border-bottom: 2px solid #edf2f7; text-align: right; font-size: 12px; color: #718096;'>PRICE</th>\n" +
                "              <th style='padding: 10px 12px; border-bottom: 2px solid #edf2f7; text-align: right; font-size: 12px; color: #718096;'>TOTAL</th>\n" +
                "            </tr>\n" +
                "          </thead>\n" +
                "          <tbody>\n" +
                "            " + itemsHtml.toString() + "\n" +
                "          </tbody>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "    \n" +
                "    <!-- Price Breakdown -->\n" +
                "    <tr>\n" +
                "      <td style='padding: 0 30px 30px 30px;'>\n" +
                "        <table align='right' width='60%' style='border-collapse: collapse; font-size: 14px;'>\n" +
                "          <tr>\n" +
                "            <td style='padding: 6px 0; color: #718096;'>Subtotal:</td>\n" +
                "            <td style='padding: 6px 0; text-align: right; color: #4a5568;'>₹" + subtotal + "</td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style='padding: 6px 0; color: #718096;'>GST (18%):</td>\n" +
                "            <td style='padding: 6px 0; text-align: right; color: #4a5568;'>₹" + taxes + "</td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style='padding: 6px 0; color: #718096;'>Shipping Charge:</td>\n" +
                "            <td style='padding: 6px 0; text-align: right; color: #4a5568;'>" + (shipping.compareTo(BigDecimal.ZERO) == 0 ? "FREE" : "₹" + shipping) + "</td>\n" +
                "          </tr>\n" +
                "          <tr style='border-top: 2px solid #edf2f7; font-weight: bold;'>\n" +
                "            <td style='padding: 12px 0 0 0; font-size: 16px; color: #1a202c;'>Grand Total:</td>\n" +
                "            <td style='padding: 12px 0 0 0; text-align: right; font-size: 18px; color: #2b6cb0;'>₹" + grandTotal + "</td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "    \n" +
                "    <!-- Support / Footer -->\n" +
                "    <tr>\n" +
                "      <td style='background-color: #f7fafc; padding: 30px; text-align: center; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; border-top: 1px solid #edf2f7;'>\n" +
                "        <p style='color: #718096; font-size: 13px; margin: 0;'>If you have any questions, please contact our support desk.</p>\n" +
                "        <p style='color: #2b6cb0; font-size: 14px; font-weight: bold; margin: 6px 0 0 0;'>support@shopsphere.com</p>\n" +
                "        <p style='color: #a0aec0; font-size: 11px; margin: 20px 0 0 0;'>&copy; 2026 ShopSphere E-Commerce. All rights reserved.</p>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";

        // Save to file for manual testing
        File emailDir = new File("d:\\Projects and Hackathons\\Shopsphere\\logs\\emails");
        if (!emailDir.exists()) {
            emailDir.mkdirs();
        }
        
        File emailFile = new File(emailDir, "order_" + orderIdStr + ".html");
        try (FileWriter writer = new FileWriter(emailFile)) {
            writer.write(htmlContent);
            log.info("Professional HTML email saved to file: {}", emailFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to write order confirmation email file", e);
        }
    }
}
