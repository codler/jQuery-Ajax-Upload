<?php 
require_once('secure_upload.php');

$options = array(
	'field' => 'uploads',
	'path' => dirname(__file__) . '/img'
);

$r = secure_upload($options);
echo json_encode($r);
if ($r['success']) {
	foreach ($r['success'] AS $file) {
		f::remove($options['path'] . '/' . str_replace('..', '.', $file['filename']));
	}
}
die();
?>
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