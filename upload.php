<span><?php echo $_POST['name']; ?><span>
<pre><?php echo print_r($_FILES); ?></pre>
<?php if (array_key_exists('uploads', $_FILES)) : ?>
<ul>
<?php for ($i = 0; $i < count($_FILES['uploads']['name']); $i++) : ?>
	<li>
		<p>Filename: <?php echo $_FILES['uploads']['name'][$i] ?></p>
		<p>File type: <?php echo $_FILES['uploads']['type'][$i] ?></p>
		<p>File size: <?php echo $_FILES['uploads']['size'][$i] ?></p>
	</li>
<?php endfor; ?>
</ul>
<?php endif; ?>