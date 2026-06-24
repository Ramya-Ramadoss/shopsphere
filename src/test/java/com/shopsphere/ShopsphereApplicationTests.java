package com.shopsphere;

import com.shopsphere.entity.Admin;
import com.shopsphere.entity.Customer;
import com.shopsphere.enums.Role;
import com.shopsphere.repository.AdminRepository;
import com.shopsphere.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@SpringBootTest
class ShopsphereApplicationTests {

	@Autowired
	private AdminRepository adminRepository;

	@Autowired
	private CustomerRepository customerRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Test
	void contextLoads() {
		System.out.println("--- Seeding Database Default Logins ---");

		// 1. Seed Admin
		String adminEmail = "admin@shopsphere.com";
		Optional<Admin> existingAdmin = adminRepository.findByEmail(adminEmail);
		if (existingAdmin.isPresent()) {
			adminRepository.delete(existingAdmin.get());
			System.out.println("Deleted existing admin: " + adminEmail);
		}

		Admin admin = Admin.builder()
				.fullName("Default Admin")
				.email(adminEmail)
				.password(passwordEncoder.encode("Admin@123"))
				.role(Role.ADMIN)
				.build();
		adminRepository.save(admin);
		System.out.println("Seeded admin successfully: " + adminEmail);

		// 2. Seed Customer 1
		String customer1Email = "customer1@shopsphere.com";
		Optional<Customer> existingCust1 = customerRepository.findByEmail(customer1Email);
		if (existingCust1.isPresent()) {
			customerRepository.delete(existingCust1.get());
			System.out.println("Deleted existing customer 1: " + customer1Email);
		}

		Customer customer1 = Customer.builder()
				.fullName("Customer One")
				.email(customer1Email)
				.password(passwordEncoder.encode("Password@123"))
				.phone("9876543211")
				.address("123 Main Street")
				.city("Chennai")
				.state("Tamil Nadu")
				.pincode("600001")
				.country("India")
				.role(Role.CUSTOMER)
				.build();
		customerRepository.save(customer1);
		System.out.println("Seeded customer 1 successfully: " + customer1Email);

		// 3. Seed Customer 2
		String customer2Email = "customer2@shopsphere.com";
		Optional<Customer> existingCust2 = customerRepository.findByEmail(customer2Email);
		if (existingCust2.isPresent()) {
			customerRepository.delete(existingCust2.get());
			System.out.println("Deleted existing customer 2: " + customer2Email);
		}

		Customer customer2 = Customer.builder()
				.fullName("Customer Two")
				.email(customer2Email)
				.password(passwordEncoder.encode("Password@123"))
				.phone("9876543212")
				.address("456 Side Street")
				.city("Bangalore")
				.state("Karnataka")
				.pincode("560002")
				.country("India")
				.role(Role.CUSTOMER)
				.build();
		customerRepository.save(customer2);
		System.out.println("Seeded customer 2 successfully: " + customer2Email);
	}

}
