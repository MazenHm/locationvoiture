pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/MazenHm/locationvoiture.git'
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'docker build -t mazenhammouda/locationvoiture-backend .'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'docker build -t mazenhammouda/locationvoiture-frontend .'
                }
            }
        }
    }
}


