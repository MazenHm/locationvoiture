pipeline {
  agent any

  options {
    skipDefaultCheckout(true)   // prevents the automatic "Declarative: Checkout SCM"
    timestamps()
  }

  environment {
    DOCKERHUB_USER = "mazenhammouda"
    BACKEND_IMAGE  = "locationvoiture-backend"
    FRONTEND_IMAGE = "locationvoiture-frontend"
  }

  stages {

    stage('Clean + Checkout') {
      steps {
        deleteDir()             // hard reset workspace (fixes "not in a git directory")
        checkout scm            // single clean checkout
        sh 'git rev-parse --is-inside-work-tree'
      }
    }

    stage('Build Backend') {
      steps {
        sh 'docker build -t $DOCKERHUB_USER/$BACKEND_IMAGE:latest backend'
      }
    }

    stage('Build Frontend') {
      steps {
        sh 'docker build -t $DOCKERHUB_USER/$FRONTEND_IMAGE:latest frontend'
      }
    }

    stage('Trivy Scan (optional)') {
      steps {
        sh '''
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image $DOCKERHUB_USER/$BACKEND_IMAGE:latest || true
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image $DOCKERHUB_USER/$FRONTEND_IMAGE:latest || true
        '''
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push $DOCKERHUB_USER/$BACKEND_IMAGE:latest
            docker push $DOCKERHUB_USER/$FRONTEND_IMAGE:latest
          '''
        }
      }
    }
  }
}
