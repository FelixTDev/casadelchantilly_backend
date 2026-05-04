-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: chantilly_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alertas_stock`
--

DROP TABLE IF EXISTS `alertas_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertas_stock` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `stock_actual` int(11) NOT NULL,
  `stock_minimo` int(11) NOT NULL,
  `atendido` tinyint(1) DEFAULT 0,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_alerta_producto` (`id_producto`),
  CONSTRAINT `fk_alerta_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas_stock`
--

LOCK TABLES `alertas_stock` WRITE;
/*!40000 ALTER TABLE `alertas_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `alertas_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carrito_items`
--

DROP TABLE IF EXISTS `carrito_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrito_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_carrito` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL,
  `notas` text DEFAULT NULL,
  `carrito_id` int(11) DEFAULT NULL,
  `producto_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_item_carrito` (`id_carrito`),
  KEY `fk_item_producto` (`id_producto`),
  KEY `FKrtdnie5q1ntdbm7edy7n7fmvd` (`carrito_id`),
  KEY `FKfaxp2h71mb51yhv0atg107irl` (`producto_id`),
  CONSTRAINT `FKfaxp2h71mb51yhv0atg107irl` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `FKrtdnie5q1ntdbm7edy7n7fmvd` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`),
  CONSTRAINT `fk_item_carrito` FOREIGN KEY (`id_carrito`) REFERENCES `carritos` (`id`),
  CONSTRAINT `fk_item_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrito_items`
--

LOCK TABLES `carrito_items` WRITE;
/*!40000 ALTER TABLE `carrito_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `carrito_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carritos`
--

DROP TABLE IF EXISTS `carritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `actualizado_en` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  UNIQUE KEY `UKdqb2sn4sl6ioxpxtm72doib9p` (`usuario_id`),
  CONSTRAINT `FK1oqtem41uj4podo8a2lbsyyhm` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_carrito_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carritos`
--

LOCK TABLES `carritos` WRITE;
/*!40000 ALTER TABLE `carritos` DISABLE KEYS */;
INSERT INTO `carritos` VALUES (1,6,'2026-04-26 16:33:56','2026-04-26 16:33:56',NULL);
/*!40000 ALTER TABLE `carritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Tortas','Tortas personalizadas para toda ocasión',NULL,1,'2026-04-12 17:14:16'),(2,'Cupcakes','Cupcakes decorados artesanalmente',NULL,1,'2026-04-12 17:14:16'),(3,'Pasteles','Pasteles individuales y por porción',NULL,1,'2026-04-12 17:14:16'),(4,'Cheesecakes','Cheesecakes en variedad de sabores',NULL,1,'2026-04-12 17:14:16'),(5,'Especiales','Productos de temporada y ediciones limitadas',NULL,1,'2026-04-12 17:14:16');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direcciones`
--

DROP TABLE IF EXISTS `direcciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direcciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `etiqueta` varchar(50) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_direcciones_usrid_ref` (`id_usuario`),
  CONSTRAINT `fk_direcciones_usrid_ref` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direcciones`
--

LOCK TABLES `direcciones` WRITE;
/*!40000 ALTER TABLE `direcciones` DISABLE KEYS */;
INSERT INTO `direcciones` VALUES (1,'Casa','CALLE LOS CLAVELES','900222111',6,'2026-05-03 05:32:46');
/*!40000 ALTER TABLE `direcciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_estados`
--

DROP TABLE IF EXISTS `historial_estados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_estados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `comentario` varchar(255) DEFAULT NULL,
  `cambiado_por` int(11) DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `fecha` datetime(6) DEFAULT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_historial_pedido` (`id_pedido`),
  KEY `fk_historial_usuario` (`cambiado_por`),
  KEY `FKhnmdeqy0wcrrgi8cqpoxoyetm` (`pedido_id`),
  CONSTRAINT `FKhnmdeqy0wcrrgi8cqpoxoyetm` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `fk_historial_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`cambiado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_estados`
--

LOCK TABLES `historial_estados` WRITE;
/*!40000 ALTER TABLE `historial_estados` DISABLE KEYS */;
INSERT INTO `historial_estados` VALUES (1,1,'PENDIENTE','Pedido creado',6,'2026-05-03 00:28:59',NULL,NULL),(2,1,'EN_PREPARACION','Actualizado por administrador',4,'2026-05-03 00:29:45',NULL,NULL),(3,1,'LISTO','Actualizado por administrador',4,'2026-05-03 00:31:14',NULL,NULL),(4,6,'PENDIENTE','Pedido creado',6,'2026-05-03 01:00:10',NULL,NULL),(5,6,'EN_PREPARACION','Actualizado por administrador',4,'2026-05-03 01:00:36',NULL,NULL),(6,6,'LISTO','Actualizado por administrador',4,'2026-05-03 01:00:49',NULL,NULL),(7,6,'ENTREGADO','Actualizado por administrador',4,'2026-05-03 01:00:59',NULL,NULL),(8,7,'PENDIENTE','Pedido creado',6,'2026-05-03 01:05:02',NULL,NULL);
/*!40000 ALTER TABLE `historial_estados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` enum('PEDIDO','STOCK','PROMOCION','SISTEMA') DEFAULT 'PEDIDO',
  `leido` tinyint(1) DEFAULT 0,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_notif_usuario` (`id_usuario`),
  CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,6,'Pedido recibido','Tu pedido CH-2026-00001 fue recibido','PEDIDO',1,'2026-05-03 00:28:59'),(2,6,'Estado de pedido actualizado','Tu pedido CH-2026-00001 ahora esta en estado EN_PREPARACION','PEDIDO',1,'2026-05-03 00:29:45'),(3,6,'Estado de pedido actualizado','Tu pedido CH-2026-00001 ahora esta en estado LISTO','PEDIDO',1,'2026-05-03 00:31:14'),(4,6,'Pedido recibido','Tu pedido CH-2026-00006 fue recibido','PEDIDO',1,'2026-05-03 01:00:10'),(5,6,'Estado de pedido actualizado','Tu pedido CH-2026-00006 ahora esta en estado EN_PREPARACION','PEDIDO',1,'2026-05-03 01:00:36'),(6,6,'Estado de pedido actualizado','Tu pedido CH-2026-00006 ahora esta en estado LISTO','PEDIDO',1,'2026-05-03 01:00:49'),(7,6,'Estado de pedido actualizado','Tu pedido CH-2026-00006 ahora esta en estado ENTREGADO','PEDIDO',1,'2026-05-03 01:00:59'),(8,6,'Pedido recibido','Tu pedido CH-2026-00007 fue recibido','PEDIDO',0,'2026-05-03 01:05:02');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `metodo_pago` enum('EFECTIVO','TRANSFERENCIA','YAPE','PLIN') NOT NULL,
  `estado_pago` enum('PENDIENTE','CONFIRMADO','RECHAZADO') DEFAULT 'PENDIENTE',
  `monto` decimal(38,2) DEFAULT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `imagen_voucher` varchar(255) DEFAULT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `estado` varchar(255) DEFAULT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_pedido` (`id_pedido`),
  UNIQUE KEY `UK9ibmqk82q3wpbw2l1jcych5kv` (`pedido_id`),
  CONSTRAINT `FKiyxf6ri3p12nsgeef15cxo5tu` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `fk_pago_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (1,1,'EFECTIVO','PENDIENTE',72.00,NULL,NULL,'2026-05-03 05:28:59','2026-05-03 00:28:59',NULL,NULL),(2,6,'EFECTIVO','PENDIENTE',75.00,NULL,NULL,'2026-05-03 06:00:10','2026-05-03 01:00:10',NULL,NULL),(3,7,'TRANSFERENCIA','PENDIENTE',70.00,NULL,NULL,'2026-05-03 06:05:02','2026-05-03 01:05:02',NULL,NULL);
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_items`
--

DROP TABLE IF EXISTS `pedido_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(38,2) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `personalizacion` text DEFAULT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `producto_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pitem_pedido` (`id_pedido`),
  KEY `fk_pitem_producto` (`id_producto`),
  KEY `FKnchocvgm3pbl25qxityq2whip` (`pedido_id`),
  KEY `FK7com1jkt4sj1l8q3y798uwf8` (`producto_id`),
  CONSTRAINT `FK7com1jkt4sj1l8q3y798uwf8` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `FKnchocvgm3pbl25qxityq2whip` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `fk_pitem_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `fk_pitem_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_items`
--

LOCK TABLES `pedido_items` WRITE;
/*!40000 ALTER TABLE `pedido_items` DISABLE KEYS */;
INSERT INTO `pedido_items` VALUES (1,1,8,1,72.00,72.00,NULL,NULL,NULL),(2,6,2,1,70.00,70.00,NULL,NULL,NULL),(3,7,1,1,65.00,65.00,NULL,NULL,NULL);
/*!40000 ALTER TABLE `pedido_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_pedido` varchar(20) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `modalidad_entrega` enum('DELIVERY','RECOJO_TIENDA') NOT NULL,
  `id_direccion` int(11) DEFAULT NULL,
  `fecha_entrega` date NOT NULL,
  `hora_entrega` time DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `costo_envio` decimal(10,2) DEFAULT 0.00,
  `descuento` decimal(10,2) DEFAULT 0.00,
  `total` decimal(38,2) DEFAULT NULL,
  `notas_cliente` text DEFAULT NULL,
  `notas_admin` text DEFAULT NULL,
  `motivo_rechazo` varchar(255) DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `actualizado_en` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha` datetime(6) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_pedido` (`codigo_pedido`),
  KEY `fk_pedido_usuario` (`id_usuario`),
  KEY `FK5g0es69v35nmkmpi8uewbphs2` (`usuario_id`),
  KEY `fk_pedido_direccion` (`id_direccion`),
  CONSTRAINT `FK5g0es69v35nmkmpi8uewbphs2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_pedido_direccion` FOREIGN KEY (`id_direccion`) REFERENCES `direcciones` (`id`),
  CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,'CH-2026-00001',6,'LISTO','RECOJO_TIENDA',NULL,'2026-05-03',NULL,72.00,0.00,0.00,72.00,'',NULL,NULL,'2026-05-03 00:28:59','2026-05-03 00:31:14',NULL,NULL),(6,'CH-2026-00006',6,'ENTREGADO','DELIVERY',1,'2026-05-03',NULL,70.00,5.00,0.00,75.00,'',NULL,NULL,'2026-05-03 01:00:10','2026-05-03 01:00:59',NULL,NULL),(7,'CH-2026-00007',6,'PENDIENTE','DELIVERY',1,'2026-05-03',NULL,65.00,5.00,0.00,70.00,'',NULL,NULL,'2026-05-03 01:05:02','2026-05-03 01:05:02',NULL,NULL);
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `precio_oferta` decimal(10,2) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `stock_minimo` int(11) DEFAULT 5,
  `imagen_url` varchar(255) DEFAULT NULL,
  `tiempo_preparacion` int(11) DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT 1,
  `en_oferta` tinyint(1) DEFAULT 0,
  `id_categoria` int(11) NOT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `actualizado_en` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `categoria_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_producto_categoria` (`id_categoria`),
  KEY `FK2fwq10nwymfv7fumctxt9vpgb` (`categoria_id`),
  CONSTRAINT `FK2fwq10nwymfv7fumctxt9vpgb` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Torta de Chocolate','Torta artesanal de chocolate con crema chantilly.',65.00,59.00,11,5,'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',120,1,1,1,'2026-04-26 16:17:46','2026-05-03 01:05:02',NULL),(2,'Torta Tres Leches','Torta húmeda de tres leches decorada con chantilly.',70.00,NULL,9,5,'https://cdn0.recetasgratis.net/es/posts/0/1/9/torta_tres_leches_8910_1200.webp',0,1,0,1,'2026-04-26 16:17:46','2026-05-03 01:04:02',NULL),(3,'Torta de Fresa','Torta suave con fresas frescas y crema.',68.00,62.00,8,5,'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600',120,1,1,1,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(4,'Torta Selva Negra','Torta de chocolate con cerezas y crema.',75.00,NULL,7,5,'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600',150,1,0,1,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(5,'Torta de Vainilla','Torta clásica de vainilla con relleno de manjar.',60.00,NULL,15,5,'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600',100,1,0,1,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(6,'Torta Red Velvet','Torta red velvet con frosting cremoso.',80.00,72.00,6,5,'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600',150,1,1,1,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(7,'Torta de Mango','Torta frutal con crema de mango.',69.00,NULL,9,5,'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600',120,1,0,1,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(8,'Torta de Maracuyá','Torta fresca con crema de maracuyá.',72.00,NULL,9,5,'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600',120,1,0,1,'2026-04-26 16:17:46','2026-05-03 00:28:59',NULL),(9,'Torta Moka','Torta con crema de café y chocolate.',74.00,68.00,5,5,'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600',150,1,1,1,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(10,'Torta Chantilly Especial','Torta especial de la casa con frutas y chantilly.',85.00,NULL,4,5,'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600',180,1,0,1,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(11,'Cupcake Chocolate','Cupcake de chocolate con crema.',8.00,NULL,30,10,'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600',45,1,0,2,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(12,'Cupcake Vainilla','Cupcake de vainilla decorado.',7.50,NULL,28,10,'https://images.unsplash.com/photo-1519869325930-281384150729?w=600',45,1,0,2,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(13,'Cupcake Fresa','Cupcake con frosting de fresa.',8.50,7.50,25,10,'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=600',45,1,1,2,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(14,'Cupcake Oreo','Cupcake con galleta Oreo.',9.00,NULL,22,10,'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600',45,1,0,2,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(15,'Cupcake Red Velvet','Cupcake red velvet con frosting.',9.50,NULL,20,10,'https://images.unsplash.com/photo-1599785209796-786432b228bc?w=600',50,1,0,2,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(16,'Cupcake Limón','Cupcake fresco con crema de limón.',8.00,NULL,24,10,'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600',45,1,0,2,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(17,'Cupcake Caramelo','Cupcake con topping de caramelo.',8.50,7.90,18,10,'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600',45,1,1,2,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(18,'Cupcake Arcoíris','Cupcake colorido para fiestas.',10.00,NULL,16,10,'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600',50,1,0,2,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(19,'Cupcake Manjar','Cupcake relleno de manjar.',10.00,NULL,19,5,'https://www.midiariodecocina.com/wp-content/uploads/2015/06/Cupcakes-de-manjar01.jpg',0,1,0,2,'2026-04-26 16:17:46','2026-04-26 16:38:20',NULL),(20,'Cupcake Especial','Cupcake premium decorado.',11.00,NULL,12,10,'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600',60,1,0,2,'2026-04-26 16:17:46','2026-04-26 16:17:46',NULL),(21,'Torta Tres Leches de Oreo','Torta de Tres Leches con sabor a Oreo y llena de chispas de chocolate.',45.00,NULL,20,5,'https://fionnabistro.com/wp-content/uploads/2020/09/Torta-Tres-Leches-de-Oreo-1-600x600.jpg',0,1,0,1,'2026-04-26 16:40:39','2026-04-26 16:40:39',NULL);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promocion_productos`
--

DROP TABLE IF EXISTS `promocion_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promocion_productos` (
  `id_promocion` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  PRIMARY KEY (`id_promocion`,`id_producto`),
  KEY `fk_promo_producto` (`id_producto`),
  CONSTRAINT `fk_promo_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`),
  CONSTRAINT `fk_promo_promocion` FOREIGN KEY (`id_promocion`) REFERENCES `promociones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promocion_productos`
--

LOCK TABLES `promocion_productos` WRITE;
/*!40000 ALTER TABLE `promocion_productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `promocion_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promociones`
--

DROP TABLE IF EXISTS `promociones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promociones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `tipo` enum('PORCENTAJE','MONTO_FIJO','2X1') NOT NULL,
  `valor` decimal(10,2) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` datetime DEFAULT current_timestamp(),
  `descuento` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promociones`
--

LOCK TABLES `promociones` WRITE;
/*!40000 ALTER TABLE `promociones` DISABLE KEYS */;
INSERT INTO `promociones` VALUES (1,'Promo Dia de La madre','Por el dia de la madre llevate un super descuento','PORCENTAJE',50.00,'2026-05-01','2026-05-10',1,'2026-05-03 00:52:30',NULL);
/*!40000 ALTER TABLE `promociones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reclamos`
--

DROP TABLE IF EXISTS `reclamos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reclamos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo` enum('PRODUCTO_INCORRECTO','PRODUCTO_DANADO','RETRASO','OTRO') NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `resolucion` text DEFAULT NULL,
  `tipo_solucion` enum('REEMBOLSO','REPOSICION','SIN_ACCION') DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `resuelto_en` datetime DEFAULT NULL,
  `fecha` datetime(6) DEFAULT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_reclamo_pedido` (`id_pedido`),
  KEY `fk_reclamo_usuario` (`id_usuario`),
  KEY `FKn1hnfb5ogamo68r0si7pu1r7n` (`pedido_id`),
  KEY `FKipke2b5h454p1aifjy24ic6kf` (`usuario_id`),
  CONSTRAINT `FKipke2b5h454p1aifjy24ic6kf` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `FKn1hnfb5ogamo68r0si7pu1r7n` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `fk_reclamo_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `fk_reclamo_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reclamos`
--

LOCK TABLES `reclamos` WRITE;
/*!40000 ALTER TABLE `reclamos` DISABLE KEYS */;
INSERT INTO `reclamos` VALUES (1,6,6,'RETRASO','Se demoro en entregar','ABIERTO',NULL,NULL,'2026-05-03 01:01:20',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `reclamos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Administrador con acceso total al sistema','2026-04-12 17:14:16'),(2,'CLIENTE','Cliente con acceso a compras y perfil personal','2026-04-12 17:14:16');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones`
--

DROP TABLE IF EXISTS `sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `token_jwt` text NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` datetime DEFAULT current_timestamp(),
  `expira_en` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sesion_usuario` (`id_usuario`),
  CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones`
--

LOCK TABLES `sesiones` WRITE;
/*!40000 ALTER TABLE `sesiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `token_recuperacion` varchar(255) DEFAULT NULL,
  `token_expiracion` datetime DEFAULT NULL,
  `id_rol` int(11) NOT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `actualizado_en` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (2,'Felix','Tintaya','felixtintaya2305@gmail.com','$2a$10$m4Yfv6TtbXpKvqjpZTWdwu8zkfJu69sdWuDynsMXT.ZNJQReZF6H6','999222111',1,NULL,NULL,2,'2026-04-13 00:26:49','2026-04-12 20:14:27'),(3,'Prueba','Auditor','prueba.auditor@chantilly.com','$2a$10$F6950wSom32jM9rttxX6uersAIpOfV0T2sNAo.ZciuCe8BpuuFd/u','123456789',1,'4a79dd3e-574a-4d6d-9d91-e913a785303d','2026-04-13 01:35:18',2,'2026-04-13 00:34:27','2026-04-12 19:35:18'),(4,'Admin','Chantilly','admin@chantilly.com','$2a$10$A9q6vSJDpH23BYhVQu1xO.V8pj4CwxpXSMRv9JzMkWV0C6KtDUuBu','',1,NULL,NULL,1,'2026-04-13 00:43:13','2026-04-26 16:35:29'),(5,'Joselyn','Profesora','joselyn@gmail.com','$2a$10$d7WRqHC.2E2OQURZm4x7YOFV38anU1gaIq7PppM7r6gi503Z2TNla','999222111',1,NULL,NULL,2,'2026-04-14 05:12:32','2026-04-14 00:12:32'),(6,'Rous','Guevara','rous@gmail.com','$2a$10$wA3ZKbP.wJlP.MwYwK60aOERYDj3JuPrkOrLl4BfQ76ptiODDWzIO','902222111',1,NULL,NULL,2,'2026-04-26 20:08:23','2026-04-26 15:08:23');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_productos_mas_vendidos`
--

DROP TABLE IF EXISTS `v_productos_mas_vendidos`;
/*!50001 DROP VIEW IF EXISTS `v_productos_mas_vendidos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_productos_mas_vendidos` AS SELECT 
 1 AS `id`,
 1 AS `nombre`,
 1 AS `categoria`,
 1 AS `total_vendido`,
 1 AS `ingresos_generados`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_reporte_ventas`
--

DROP TABLE IF EXISTS `v_reporte_ventas`;
/*!50001 DROP VIEW IF EXISTS `v_reporte_ventas`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_reporte_ventas` AS SELECT 
 1 AS `fecha`,
 1 AS `total_pedidos`,
 1 AS `ingresos_total`,
 1 AS `ticket_promedio`,
 1 AS `pedidos_entregados`,
 1 AS `pedidos_cancelados`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'chantilly_db'
--

--
-- Dumping routines for database 'chantilly_db'
--

--
-- Final view structure for view `v_productos_mas_vendidos`
--

/*!50001 DROP VIEW IF EXISTS `v_productos_mas_vendidos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_productos_mas_vendidos` AS select `pr`.`id` AS `id`,`pr`.`nombre` AS `nombre`,`c`.`nombre` AS `categoria`,sum(`pi`.`cantidad`) AS `total_vendido`,sum(`pi`.`subtotal`) AS `ingresos_generados` from (((`pedido_items` `pi` join `productos` `pr` on(`pi`.`id_producto` = `pr`.`id`)) join `categorias` `c` on(`pr`.`id_categoria` = `c`.`id`)) join `pedidos` `p` on(`pi`.`id_pedido` = `p`.`id`)) where `p`.`estado` = 'ENTREGADO' group by `pr`.`id`,`pr`.`nombre`,`c`.`nombre` order by sum(`pi`.`cantidad`) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_reporte_ventas`
--

/*!50001 DROP VIEW IF EXISTS `v_reporte_ventas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_reporte_ventas` AS select cast(`p`.`creado_en` as date) AS `fecha`,count(`p`.`id`) AS `total_pedidos`,sum(`p`.`total`) AS `ingresos_total`,avg(`p`.`total`) AS `ticket_promedio`,sum(case when `p`.`estado` = 'ENTREGADO' then 1 else 0 end) AS `pedidos_entregados`,sum(case when `p`.`estado` = 'CANCELADO' then 1 else 0 end) AS `pedidos_cancelados` from `pedidos` `p` group by cast(`p`.`creado_en` as date) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-03  1:16:53
