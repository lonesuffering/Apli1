<?php
/** @var \App\Model\Film $film */
?>

<div class="form-group">
    <label for="title">Title</label>
    <input type="text" id="title" name="film[title]" value="<?= $film->getTitle(); ?>">
</div>

<div class="form-group">
    <label for="description">Description</label>
    <textarea id="description" name="film[description]"><?= $film->getDescription(); ?></textarea>
</div>

<div class="form-group">
    <label for="duration">Duration</label>
    <input type="number" id="duration" name="film[duration]" value="<?= $film->getDuration(); ?>">
</div>

<div class="form-group">
    <label></label>
    <input type="submit" value="Submit">
</div>
