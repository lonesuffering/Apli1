<?php

/** @var \App\Model\Film $film */
/** @var \App\Service\Router $router */

$title = "Edit Film {$film->getTitle()} ({$film->getId()})";
$bodyClass = 'edit';

ob_start(); ?>
    <h1><?= $title ?></h1>
    <form action="<?= $router->generatePath('film-edit') ?>" method="post" class="edit-form">
        <?php require __DIR__ . DIRECTORY_SEPARATOR . '_form.html.php'; ?>
        <input type="hidden" name="action" value="film-edit">
        <input type="hidden" name="id" value="<?= $film->getId() ?>">
    </form>

    <ul class="action-list">
        <li>
            <a href="<?= $router->generatePath('film-index') ?>">Back to list</a></li>
        <li>
            <form action="<?= $router->generatePath('film-delete') ?>" method="post">
                <input type="submit" value="Delete" onclick="return confirm('Are you sure?')">
                <input type="hidden" name="action" value="film-delete">
                <input type="hidden" name="id" value="<?= $film->getId() ?>">
            </form>
        </li>
    </ul>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';
