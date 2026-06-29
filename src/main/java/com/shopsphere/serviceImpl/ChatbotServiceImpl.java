package com.shopsphere.serviceImpl;

import com.shopsphere.dto.request.ChatbotRequest;
import com.shopsphere.dto.response.ChatbotResponse;
import com.shopsphere.dto.response.OrderResponse;
import com.shopsphere.dto.response.ProductResponse;
import com.shopsphere.entity.Customer;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.Product;
import com.shopsphere.mapper.OrderMapper;
import com.shopsphere.mapper.ProductMapper;
import com.shopsphere.repository.CustomerRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final OrderMapper orderMapper;

    @Override
    public ChatbotResponse getResponse(ChatbotRequest request) {
        String msg = request.getMessage() != null ? request.getMessage().trim().toLowerCase() : "";
        Long customerId = request.getCustomerId();
        
        String customerName = "Guest";
        String greeting = "Hello! ";
        
        if (customerId != null) {
            Optional<Customer> customerOpt = customerRepository.findById(customerId);
            if (customerOpt.isPresent()) {
                customerName = customerOpt.get().getFullName();
                String firstName = customerName.split(" ")[0];
                greeting = "Hi " + firstName + "! ";
            }
        }

        List<ProductResponse> recommendedProducts = new ArrayList<>();
        List<OrderResponse> relatedOrders = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();
        String reply;

        // 1. Order Tracking Query
        if (msg.contains("order") && (msg.contains("where") || msg.contains("track") || msg.contains("status") || msg.contains("my"))) {
            if (customerId == null) {
                reply = greeting + "Please log in to track your orders.";
                suggestions.add("Log in to my account");
            } else {
                List<Order> orders = orderRepository.findByCustomerId(customerId);
                if (orders.isEmpty()) {
                    reply = greeting + "I couldn't find any orders in your purchase history. Do you want to browse our premium products?";
                    suggestions.add("Show premium products");
                    suggestions.add("What are today's offers?");
                } else {
                    // Get latest order
                    List<Order> sortedOrders = new ArrayList<>(orders);
                    sortedOrders.sort(Comparator.comparing(Order::getId).reversed());
                    Order latestOrder = sortedOrders.get(0);
                    OrderResponse latestResp = orderMapper.toResponse(latestOrder);
                    relatedOrders.add(latestResp);
                    
                    String status = latestOrder.getOrderStatus().name();
                    String estDate = latestResp.getExpectedDeliveryDate() != null ? 
                            latestResp.getExpectedDeliveryDate().toLocalDate().toString() : "soon";
                    
                    reply = greeting + "Your most recent order is <b>#" + latestOrder.getId() + "</b>. " +
                            "Its current status is <span class='font-bold text-blue-600'>" + status + "</span>. " +
                            "Expected Delivery Date: <b>" + estDate + "</b> via <b>" + latestResp.getCourierPartner() + "</b>. " +
                            "Tracking ID: <code>" + latestResp.getTrackingId() + "</code>.";
                            
                    suggestions.add("Help me return an order");
                    suggestions.add("Show all my orders");
                    suggestions.add("Show similar products");
                }
            }
        }
        
        // 2. Budget Laptop Query
        else if (msg.contains("laptop")) {
            // Find price limit using regex
            Pattern pattern = Pattern.compile("(?i)(under|below|\\b|₹|rs|rs\\.?\\s*)(\\d{4,6})");
            Matcher matcher = pattern.matcher(msg);
            BigDecimal limit = null;
            if (matcher.find()) {
                limit = new BigDecimal(matcher.group(2));
            }
            
            // Search all non-deleted products
            List<Product> products = productRepository.findByDeletedFalse();
            BigDecimal finalLimit = limit;
            
            List<Product> matchingLaptops = products.stream()
                    .filter(p -> p.getProductName().toLowerCase().contains("laptop") || 
                                 (p.getCategory() != null && p.getCategory().getName().toLowerCase().contains("electronics")) ||
                                 p.getDescription().toLowerCase().contains("laptop"))
                    .filter(p -> finalLimit == null || p.getPrice().compareTo(finalLimit) <= 0)
                    .limit(5)
                    .collect(Collectors.toList());
            
            if (matchingLaptops.isEmpty()) {
                reply = greeting + "I couldn't find any laptops " + (limit != null ? "under ₹" + limit : "") + " in our catalog currently. Would you like to check out other Electronics?";
                suggestions.add("Show Electronics");
            } else {
                recommendedProducts = matchingLaptops.stream().map(productMapper::toResponse).collect(Collectors.toList());
                reply = greeting + "Here are some laptops I recommend " + (limit != null ? "under ₹" + limit : "") + ":";
                suggestions.add("Recommend premium products");
            }
        }
        
        // 3. Premium Products Query
        else if (msg.contains("premium") || msg.contains("luxury") || msg.contains("exclusive")) {
            List<Product> premiumProducts = productRepository.findByDeletedFalse().stream()
                    .filter(p -> p.getPremium() != null && p.getPremium())
                    .limit(5)
                    .collect(Collectors.toList());
            
            if (premiumProducts.isEmpty()) {
                reply = greeting + "We don't have any premium products in the shop today. Would you like to check out today's discounted deals?";
                suggestions.add("What are today's offers?");
            } else {
                recommendedProducts = premiumProducts.stream().map(productMapper::toResponse).collect(Collectors.toList());
                reply = greeting + "Welcome to our VIP catalog! Here are our hand-picked ShopSphere Premium products:";
                suggestions.add("Suggest laptops under ₹50000");
                suggestions.add("Show today's offers");
            }
        }
        
        // 4. Today's Offers Query
        else if (msg.contains("offer") || msg.contains("discount") || msg.contains("deal") || msg.contains("sale")) {
            List<Product> discountProducts = productRepository.findByDeletedFalse().stream()
                    .filter(p -> p.getActive() != null && p.getActive())
                    .limit(5)
                    .collect(Collectors.toList());
            
            if (discountProducts.isEmpty()) {
                reply = greeting + "We don't have any products active in the shop today, but we offer standard Free Delivery for orders above ₹999!";
                suggestions.add("Explain delivery charges");
            } else {
                recommendedProducts = discountProducts.stream().map(productMapper::toResponse).collect(Collectors.toList());
                reply = greeting + "Check out today's featured deals and hot items:";
                suggestions.add("Recommend premium products");
            }
        }
        
        // 5. Similar Products Query
        else if (msg.contains("similar") || msg.contains("recommend") || msg.contains("like")) {
            // Find most recently viewed product or just get a few featured items
            List<Product> similar = productRepository.findByDeletedFalse().stream()
                    .filter(p -> p.getActive() != null && p.getActive())
                    .limit(5)
                    .collect(Collectors.toList());
            recommendedProducts = similar.stream().map(productMapper::toResponse).collect(Collectors.toList());
            reply = greeting + "Based on your browsing, here are some items you might like:";
            suggestions.add("What are today's offers?");
        }
        
        // 6. Return Policies
        else if (msg.contains("return") || msg.contains("refund") || msg.contains("replace")) {
            reply = greeting + "<b>ShopSphere Return Policy:</b><br/>" +
                    "1. Items can be returned within 10 days of delivery.<br/>" +
                    "2. Return packages must have original tags and invoice.<br/>" +
                    "3. Refund is credited back to your original payment method within 3-5 business days.<br/>" +
                    "To start a return, go to your <i>Order History</i> page, select the delivered order, and click 'Initiate Return'.";
            suggestions.add("Where is my order?");
            suggestions.add("Contact support team");
        }
        
        // 7. Shipping / Delivery charges explanation
        else if (msg.contains("shipping") || msg.contains("delivery") || msg.contains("charge") || msg.contains("fee")) {
            reply = greeting + "<b>ShopSphere Shipping Calculations:</b><br/>" +
                    "- <b>Standard Delivery:</b> ₹49 (FREE for orders above ₹999!)<br/>" +
                    "- <b>Express Delivery:</b> ₹99 flat rate.<br/>" +
                    "You can select your preferred shipping method at Checkout.";
            suggestions.add("What are today's offers?");
            suggestions.add("Where is my order?");
        }
        
        // 8. General Help / FAQ Fallback
        else {
            reply = "Welcome to ShopSphere AI Shopping Assistant! I can help you with:<br/>" +
                    "• Tracking your order status (\"Where is my order?\")<br/>" +
                    "• Recommending items under a budget (\"Show laptops under ₹50000\")<br/>" +
                    "• Finding exclusive premium items (\"Show premium products\")<br/>" +
                    "• Today's offers & discounts (\"What are today's offers?\")<br/>" +
                    "• Explaining returns & refunds policies.<br/><br/>" +
                    "How can I assist you today?";
            suggestions.add("Where is my order?");
            suggestions.add("Suggest laptops under ₹50000");
            suggestions.add("Recommend premium products");
            suggestions.add("What are today's offers?");
        }

        return ChatbotResponse.builder()
                .reply(reply)
                .products(recommendedProducts)
                .orders(relatedOrders)
                .suggestions(suggestions)
                .build();
    }
}
