package com.integrador.chantilly;

import com.integrador.chantilly.producto.entity.Categoria;
import com.integrador.chantilly.producto.entity.Producto;
import com.integrador.chantilly.producto.repository.CategoriaRepository;
import com.integrador.chantilly.producto.repository.ProductoRepository;
import com.integrador.chantilly.usuario.entity.Role;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.RoleRepository;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@SpringBootApplication
public class ChantillyApplication {

	private static final Logger log = LoggerFactory.getLogger(ChantillyApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(ChantillyApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedRolesAndAdmin(RoleRepository roleRepository,
												CategoriaRepository categoriaRepository,
												ProductoRepository productoRepository,
												UsuarioRepository usuarioRepository,
												PasswordEncoder passwordEncoder,
												@Value("${app.seed.default-admin.enabled:false}") boolean seedDefaultAdmin,
												@Value("${app.seed.default-admin.email:admin@chantilly.com}") String defaultAdminEmail,
												@Value("${app.seed.default-admin.password:}") String defaultAdminPassword,
												@Value("${app.seed.catalog.enabled:false}") boolean seedCatalog) {
		return args -> {
			Role adminRole = roleRepository.findByNombre("ADMIN")
					.orElseGet(() -> roleRepository.save(new Role("ADMIN")));
			roleRepository.findByNombre("CLIENTE")
					.orElseGet(() -> roleRepository.save(new Role("CLIENTE")));

			if (seedCatalog && categoriaRepository.count() == 0 && productoRepository.count() == 0) {
				Categoria categoria = new Categoria();
				categoria.setNombre("Tortas");
				categoria.setDescripcion("Catálogo base para pruebas automáticas");
				categoria.setActivo(true);
				Categoria savedCategory = categoriaRepository.save(categoria);

				Producto producto = new Producto();
				producto.setNombre("Torta E2E Chantilly");
				producto.setDescripcion("Producto base para flujos automatizados");
				producto.setPrecio(new BigDecimal("68.00"));
				producto.setPrecioOferta(null);
				producto.setStock(25);
				producto.setStockMinimo(5);
				producto.setImagenUrl("https://images.unsplash.com/photo-1578985545062-69928b1d9587");
				producto.setTiempoPreparacion(60);
				producto.setDisponible(true);
				producto.setEnOferta(false);
				producto.setCategoria(savedCategory);
				productoRepository.save(producto);
			}

			if (!seedDefaultAdmin) {
				return;
			}

			if (defaultAdminPassword == null || defaultAdminPassword.isBlank()) {
				log.warn("Default admin seed is enabled but no password was configured; skipping admin user bootstrap");
				return;
			}

			Usuario admin = usuarioRepository.findByEmail(defaultAdminEmail).orElse(null);
			if (admin == null) {
				admin = new Usuario();
				admin.setNombre("Admin");
				admin.setApellido("Chantilly");
				admin.setEmail(defaultAdminEmail);
				admin.setTelefono("");
				admin.setActivo(true);
			}

			admin.setRol(adminRole);
			admin.setActivo(true);
			if (admin.getPasswordHash() == null || !passwordEncoder.matches(defaultAdminPassword, admin.getPasswordHash())) {
				admin.setPasswordHash(passwordEncoder.encode(defaultAdminPassword));
			}
			usuarioRepository.save(admin);
		};
	}
}
