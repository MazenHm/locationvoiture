pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "mazenhammouda"
        BACKEND_IMAGE  = "locationvoiture-backend"
        FRONTEND_IMAGE = "locationvoiture-frontend"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t $DOCKERHUB_USER/$BACKEND_IMAGE backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t $DOCKERHUB_USER/$FRONTEND_IMAGE frontend'
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
                    docker push $DOCKERHUB_USER/$BACKEND_IMAGE
                    docker push $DOCKERHUB_USER/$FRONTEND_IMAGE
                    '''
                }
            }
        }
    }
}
