package com.shopsphere.config;

import com.shopsphere.entity.Product;
import com.shopsphere.entity.ProductImage;
import com.shopsphere.entity.Inventory;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.ProductImageRepository;
import com.shopsphere.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.shopsphere.entity.Admin;
import com.shopsphere.entity.Customer;
import com.shopsphere.entity.Category;
import com.shopsphere.repository.AdminRepository;
import com.shopsphere.repository.CustomerRepository;
import com.shopsphere.repository.CategoryRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final InventoryRepository inventoryRepository;
    private final AdminRepository adminRepository;
    private final CustomerRepository customerRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Running database self-healing and seeder...");

        log.info("Existing Admins:");
        adminRepository.findAll().forEach(a -> log.info("Admin Email: '{}', Role: '{}'", a.getEmail(), a.getRole()));

        log.info("Existing Customers:");
        customerRepository.findAll().forEach(c -> log.info("Customer Email: '{}'", c.getEmail()));

        // 1. Seed Admin
        if (!adminRepository.existsByEmail("ramya.admin@shopsphere.com")) {
            log.info("Seeding default admin...");
            Admin admin = Admin.builder()
                    .fullName("Ramya Sharma")
                    .email("ramya.admin@shopsphere.com")
                    .password(passwordEncoder.encode("admin123hash"))
                    .role(com.shopsphere.enums.Role.ADMIN)
                    .build();
            adminRepository.save(admin);
            log.info("Default admin seeded.");
        }

        // 2. Seed Customers
        if (!customerRepository.existsByEmail("aarav@gmail.com")) {
            log.info("Seeding customer aarav...");
            Customer customer1 = Customer.builder()
                    .fullName("Aarav Patel")
                    .email("aarav@gmail.com")
                    .password(passwordEncoder.encode("hash101"))
                    .phone("9876500001")
                    .address("12 MG Road")
                    .city("Bangalore")
                    .state("Karnataka")
                    .pincode("560001")
                    .country("India")
                    .enabled(true)
                    .role(com.shopsphere.enums.Role.CUSTOMER)
                    .build();
            customerRepository.save(customer1);
        }

        if (!customerRepository.existsByEmail("diya@gmail.com")) {
            log.info("Seeding customer diya...");
            Customer customer2 = Customer.builder()
                    .fullName("Diya Reddy")
                    .email("diya@gmail.com")
                    .password(passwordEncoder.encode("hash102"))
                    .phone("9876500002")
                    .address("45 Anna Nagar")
                    .city("Chennai")
                    .state("Tamil Nadu")
                    .pincode("600040")
                    .country("India")
                    .enabled(true)
                    .role(com.shopsphere.enums.Role.CUSTOMER)
                    .build();
            customerRepository.save(customer2);
        }

        if (!customerRepository.existsByEmail("arjun@gmail.com")) {
            log.info("Seeding customer arjun...");
            Customer customer3 = Customer.builder()
                    .fullName("Arjun Kumar")
                    .email("arjun@gmail.com")
                    .password(passwordEncoder.encode("hash103"))
                    .phone("9876500003")
                    .address("21 Banjara Hills")
                    .city("Hyderabad")
                    .state("Telangana")
                    .pincode("500034")
                    .country("India")
                    .enabled(true)
                    .role(com.shopsphere.enums.Role.CUSTOMER)
                    .build();
            customerRepository.save(customer3);
        }

        // 3. Seed Categories
        if (categoryRepository.count() == 0) {
            log.info("Seeding default categories...");
            Category elec = Category.builder().name("Electronics").description("Gadgets, devices, and accessories").active(true).build();
            categoryRepository.save(elec);
            Category cloth = Category.builder().name("Clothing").description("Apparel, footwear, and accessories").active(true).build();
            categoryRepository.save(cloth);
            Category home = Category.builder().name("Home & Kitchen").description("Furniture, decor, and appliances").active(true).build();
            categoryRepository.save(home);
            Category book = Category.builder().name("Books").description("Fiction, non-fiction, and educational books").active(true).build();
            categoryRepository.save(book);
            Category sports = Category.builder().name("Sports & Outdoors").description("Fitness equipment and outdoor gear").active(true).build();
            categoryRepository.save(sports);
            log.info("Default categories seeded.");
        }

        // 4. Seed Products
        if (productRepository.count() == 0) {
            log.info("Seeding default products...");
            Category elec = categoryRepository.findAll().stream().filter(c -> c.getName().equals("Electronics")).findFirst().orElse(null);
            Category cloth = categoryRepository.findAll().stream().filter(c -> c.getName().equals("Clothing")).findFirst().orElse(null);
            Category home = categoryRepository.findAll().stream().filter(c -> c.getName().equals("Home & Kitchen")).findFirst().orElse(null);
            Category book = categoryRepository.findAll().stream().filter(c -> c.getName().equals("Books")).findFirst().orElse(null);
            Category sports = categoryRepository.findAll().stream().filter(c -> c.getName().equals("Sports & Outdoors")).findFirst().orElse(null);
            Admin admin = adminRepository.findAll().stream().findFirst().orElse(null);

            if (elec != null) {
                productRepository.save(Product.builder().productName("iPhone 15").brand("Apple").sku("ELEC001").description("Apple iPhone 15 128GB").price(java.math.BigDecimal.valueOf(79999)).active(true).approved(true).category(elec).admin(admin).build());
                productRepository.save(Product.builder().productName("Galaxy S24").brand("Samsung").sku("ELEC002").description("Samsung Galaxy S24 256GB").price(java.math.BigDecimal.valueOf(74999)).active(true).approved(true).category(elec).admin(admin).build());
                productRepository.save(Product.builder().productName("MacBook Air M3").brand("Apple").sku("ELEC003").description("13-inch Apple laptop").price(java.math.BigDecimal.valueOf(124999)).active(true).approved(true).category(elec).admin(admin).build());
                productRepository.save(Product.builder().productName("Sony WH-1000XM5").brand("Sony").sku("ELEC005").description("Noise Cancelling Headphones").price(java.math.BigDecimal.valueOf(28999)).active(true).approved(true).category(elec).admin(admin).build());
            }
            if (cloth != null) {
                productRepository.save(Product.builder().productName("Men's Casual Shirt").brand("Levis").sku("FASH001").description("Cotton casual shirt").price(java.math.BigDecimal.valueOf(1999)).active(true).approved(true).category(cloth).admin(admin).build());
                productRepository.save(Product.builder().productName("Women's Kurti").brand("Biba").sku("FASH002").description("Printed cotton kurti").price(java.math.BigDecimal.valueOf(1499)).active(true).approved(true).category(cloth).admin(admin).build());
                productRepository.save(Product.builder().productName("Running Shoes").brand("Nike").sku("FASH003").description("Nike Air Running Shoes").price(java.math.BigDecimal.valueOf(5999)).active(true).approved(true).category(cloth).admin(admin).build());
            }
            if (home != null) {
                productRepository.save(Product.builder().productName("Mixer Grinder").brand("Prestige").sku("HOME001").description("750W Mixer Grinder").price(java.math.BigDecimal.valueOf(3499)).active(true).approved(true).category(home).admin(admin).build());
                productRepository.save(Product.builder().productName("Vacuum Cleaner").brand("Philips").sku("HOME003").description("Dry vacuum cleaner").price(java.math.BigDecimal.valueOf(7999)).active(true).approved(true).category(home).admin(admin).build());
            }
            if (book != null) {
                productRepository.save(Product.builder().productName("Clean Code").brand("Pearson").sku("BOOK001").description("Programming Book").price(java.math.BigDecimal.valueOf(799)).active(true).approved(true).category(book).admin(admin).build());
                productRepository.save(Product.builder().productName("Atomic Habits").brand("Random House").sku("BOOK002").description("Self Improvement Book").price(java.math.BigDecimal.valueOf(599)).active(true).approved(true).category(book).admin(admin).build());
            }
            if (sports != null) {
                productRepository.save(Product.builder().productName("Cricket Bat").brand("SG").sku("SPORT001").description("English Willow Bat").price(java.math.BigDecimal.valueOf(5999)).active(true).approved(true).category(sports).admin(admin).build());
                productRepository.save(Product.builder().productName("Yoga Mat").brand("Boldfit").sku("SPORT003").description("Anti-slip yoga mat").price(java.math.BigDecimal.valueOf(999)).active(true).approved(true).category(sports).admin(admin).build());
            }
            log.info("Default products seeded.");
        }

        List<Product> products = productRepository.findAll();
        log.info("Found {} products in the database.", products.size());

        for (Product product : products) {
            boolean updated = false;

            // 1. Ensure approved is true so they show up in Active Catalog
            if (product.getApproved() == null || !product.getApproved()) {
                product.setApproved(true);
                updated = true;
                log.info("Set product approved = true for product SKU: {}", product.getSku());
            }

            // 2. Ensure deleted is false
            if (product.getDeleted() == null) {
                product.setDeleted(false);
                updated = true;
            }

            // 3. Ensure active is true
            if (product.getActive() == null) {
                product.setActive(true);
                updated = true;
            }

            if (updated) {
                productRepository.save(product);
            }

            // 4. Ensure inventory exists
            if (product.getInventory() == null) {
                Inventory inventory = Inventory.builder()
                        .product(product)
                        .quantity(50)
                        .reservedQuantity(0)
                        .inStock(true)
                        .build();
                inventoryRepository.save(inventory);
                log.info("Seeded default inventory for product SKU: {}", product.getSku());
            }

            // 5. Ensure at least 4 images exist for every product (3-4 requested)
            List<ProductImage> images = productImageRepository.findByProductId(product.getId());
            int currentCount = images != null ? images.size() : 0;
            if (currentCount < 4) {
                log.info("Product SKU: {} has {} images. Adding remaining mock images to reach 4...", product.getSku(), currentCount);
                
                boolean hasPrimary = false;
                if (images != null) {
                    for (ProductImage img : images) {
                        if (img.getPrimaryImage() != null && img.getPrimaryImage()) {
                            hasPrimary = true;
                            break;
                        }
                    }
                }

                for (int i = currentCount + 1; i <= 4; i++) {
                    boolean isPrimary = (i == 1 && !hasPrimary);
                    String suffix = "_" + i + ".jpg";
                    String skuLower = product.getSku().toLowerCase();
                    
                    String imageUrl = "images/products/" + skuLower + suffix;
                    
                    ProductImage newImg = ProductImage.builder()
                            .product(product)
                            .imageUrl(imageUrl)
                            .altText(product.getProductName() + " View " + i)
                            .primaryImage(isPrimary)
                            .sortOrder(i - 1)
                            .build();
                    productImageRepository.save(newImg);
                }
            }
        }

        log.info("Database self-healing and seeding completed.");
    }
}
