pipeline {
  agent any
  options {
    timestamps()
  }

  environment {
    DOCKERHUB_USER = "mazenhammouda"
    BACKEND_IMAGE  = "locationvoiture-backend"
    FRONTEND_IMAGE = "locationvoiture-frontend"
    REPO_URL       = "https://github.com/MazenHm/locationvoiture.git"
  }

  stages {

    stage('Clean Workspace') {
      steps {
        deleteDir()
      }
    }

    stage('Checkout Code') {
      steps {
        git url: "${REPO_URL}", branch: "main"
        sh 'git status'
      }
    }

    stage('Build Backend') {
      steps {
        sh 'docker build -t $DOCKERHUB_USER/$BACKEND_IMAGE backend'
      }
    }

    stage('Build Frontend') {
      steps {
        sh 'docker build -t $DOCKERHUB_USER/$FRONTEND_IMAGE frontend'
      }
    }

    stage('Push Images') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push $DOCKERHUB_USER/$BACKEND_IMAGE
            docker push $DOCKERHUB_USER/$FRONTEND_IMAGE
          '''
        }
      }
    }
  }
}
