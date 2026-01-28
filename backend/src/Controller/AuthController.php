<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class AuthController extends AbstractController
{
    #[Route('/api/register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (
            !$data ||
            !isset($data['name'], $data['email'], $data['password'])
        ) {
            return new JsonResponse(['error' => 'Name, email and password required'], 400);
        }

        $user = new User();
        $user->setName($data['name']);
        $user->setEmail($data['email']);
        $user->setRoles(['ROLE_USER']);

        $hashedPassword = $passwordHasher->hashPassword(
            $user,
            $data['password']
        );

        $user->setPassword($hashedPassword);

        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User registered'], 201);
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);
    }
}