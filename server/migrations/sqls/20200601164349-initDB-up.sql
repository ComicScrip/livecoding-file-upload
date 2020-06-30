CREATE TABLE `posts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text,
  `main_picture_url` varchar(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
