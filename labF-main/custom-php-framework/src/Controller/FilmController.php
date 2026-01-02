<?php

namespace App\Controller;

use App\Model\Film;
use App\Service\Router;
use App\Service\Templating;

class FilmController
{
    public function indexAction(Templating $templating, Router $router): string
    {
        $films = Film::findAll();
        return $templating->render('film/index.html.php', [
            'films' => $films,
            'router' => $router
        ]);
    }

    public function showAction(int $filmId, Templating $templating, Router $router): string
    {
        $film = Film::find($filmId);
        if (!$film) {
            http_response_code(404);
            return "Film not found";
        }

        return $templating->render('film/show.html.php', [
            'film' => $film,
            'router' => $router
        ]);
    }

    public function createAction(?array $requestPost, Templating $templating, Router $router): string
    {
        $film = new Film();

        if ($requestPost) {
            $film->fill($requestPost);

            if ($this->validate($film)) {
                $film->save();
                $path = $router->generatePath('film-index');
                $router->redirect($path);
                return '';
            }
        }

        return $templating->render('film/create.html.php', [
            'film' => $film,
            'router' => $router
        ]);
    }

    public function editAction(int $filmId, ?array $requestPost, Templating $templating, Router $router): string
    {
        $film = Film::find($filmId);
        if (!$film) {

            http_response_code(404);
            return "Film not found";
        }

        if ($requestPost) {
            $film->fill($requestPost);

            if ($this->validate($film)) {
                $film->save();
                $path = $router->generatePath('film-index');
                $router->redirect($path);
                return '';
            }
        }

        return $templating->render('film/edit.html.php', [
            'film' => $film,
            'router' => $router
        ]);
    }

    public function deleteAction(int $filmId, Router $router): string
    {
        $film = Film::find($filmId);
        if (!$film) {

            http_response_code(404);
            return "Film not found";
        }

        $film->delete();
        $path = $router->generatePath('film-index');
        $router->redirect($path);
        return '';
    }

    private function validate(Film $film): bool
    {
        $errors = [];

        if (empty($film->getTitle())) {
            $errors[] = "Title cannot be empty.";
        }
        if (empty($film->getDescription())) {
            $errors[] = "Description cannot be empty.";
        }
        if (!$film->getDuration() || $film->getDuration() <= 0) {
            $errors[] = "Duration must be a positive number.";
        }

        if (!empty($errors)) {
            foreach ($errors as $error) {
                echo "<p class='error'>{$error}</p>";
            }
            return false;
        }

        return true;
    }

}